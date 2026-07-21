import request from 'supertest';
import { test, expect, beforeAll, afterAll } from 'vitest';
import app from '../../app.js';
import { supabase } from '../../config/supabase.js';

// This E2E test will create minimal fixtures (student, allocation, fee) when
// TEST_FEE_ID is not provided. It cleans up created rows afterwards.
// Env vars:
// - TEST_FEE_ID: (optional) use an existing fee id instead of creating fixtures
// - TEST_SERVER_URL: (optional) run requests against an already-running server

const TEST_FEE_ID = process.env.TEST_FEE_ID;
const TEST_SERVER_URL = process.env.TEST_SERVER_URL;

let createdStudentId = null;
let createdAllocationId = null;
let createdFeeId = null;

const makeRequest = () => (TEST_SERVER_URL ? request(TEST_SERVER_URL) : request(app));

beforeAll(async () => {
  if (TEST_FEE_ID) {
    createdFeeId = TEST_FEE_ID;
    return;
  }

  // Create a minimal student
  const studentPayload = {
    full_name: `E2E Student ${Date.now()}`,
    roll_number: `E2E-${Math.floor(Math.random() * 100000)}`,
    email: `e2e${Date.now()}@example.com`,
  };

  const { data: studentData, error: studentError } = await supabase.from('students').insert([studentPayload]).select().maybeSingle();
  if (studentError) throw studentError;
  createdStudentId = studentData.id;

  // Attempt to link to an existing hostel/block/room for realism
  let hostelId = null;
  let blockId = null;
  let roomId = null;
  try {
    const { data: roomData } = await supabase.from('hostel_rooms').select('id, room_number, block_id, hostel_id').limit(1).maybeSingle();
    if (roomData) {
      roomId = roomData.id;
      blockId = roomData.block_id || null;
      hostelId = roomData.hostel_id || null;
    } else {
      const { data: blockData } = await supabase.from('hostel_blocks').select('id, name, hostel_id').limit(1).maybeSingle();
      if (blockData) {
        blockId = blockData.id;
        hostelId = blockData.hostel_id || null;
      }
    }
  } catch (e) {
    // ignore if tables don't exist in the test schema
  }

  // Create a lightweight allocation (if hostel_allocations table exists)
  try {
    const allocPayload: any = {
      student_id: createdStudentId,
      hostel_id: hostelId,
      block_id: blockId,
      room_id: roomId,
      academic_year: '2025-2026',
      status: 'Active',
    };
    const { data: allocData } = await supabase.from('hostel_allocations').insert([allocPayload]).select().maybeSingle();
    createdAllocationId = allocData?.id || null;
  } catch (e) {
    createdAllocationId = null;
  }

  // Create an unpaid hostel fee linked to the above
  const feePayload: any = {
    student_id: createdStudentId,
    hostel_id: hostelId,
    block_id: blockId,
    room_id: roomId,
    resident_name: studentPayload.full_name,
    registration_number: studentPayload.roll_number,
    room_number: roomId ? undefined : 'E2E-101',
    total_fee: 1000,
    total_amount: 1000,
    amount_paid: 0,
    paid_amount: 0,
    pending_amount: 1000,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_status: 'Pending',
    status: 'Pending',
    academic_year: '2025-2026',
  };

  const { data: feeData, error: feeError } = await supabase.from('hostel_fees').insert([feePayload]).select().maybeSingle();
  if (feeError) throw feeError;
  createdFeeId = feeData.id;
});

afterAll(async () => {
  // Clean up payments, fee, allocation, student
  try {
    if (createdFeeId) {
      await supabase.from('hostel_fee_payments').delete().eq('fee_id', createdFeeId);
      await supabase.from('hostel_fee_receipts').delete().eq('fee_id', createdFeeId);
      await supabase.from('hostel_fees').delete().eq('id', createdFeeId);
    }
    if (createdAllocationId) {
      await supabase.from('hostel_allocations').delete().eq('id', createdAllocationId);
    }
    if (createdStudentId) {
      await supabase.from('students').delete().eq('id', createdStudentId);
    }
  } catch (err) {
    // Best-effort cleanup; log but don't fail
    // eslint-disable-next-line no-console
    console.error('E2E cleanup error:', err?.message || err);
  }
});

test('recordPayment endpoint records a payment and returns updated fee', async () => {
  const feeToUse = createdFeeId;
  if (!feeToUse) {
    test.skip('No fee available for E2E test');
    return;
  }

  const txn = `E2E-TXN-${Date.now()}`;
  const res = await makeRequest()
    .post(`/api/hostel/fees/${feeToUse}/pay`)
    .send({ amount: 1, paymentMethod: 'E2E-Test', transactionId: txn })
    .set('Accept', 'application/json');

  expect([200, 201]).toContain(res.status);
  expect(res.body).toBeDefined();
  expect(res.body.success).toBeTruthy();
  expect(res.body.data).toBeDefined();
  // Basic shape checks
  expect(res.body.data.paymentStatus || res.body.data.payment_status).toBeTruthy();
  expect(res.body.data.receiptNumber || res.body.data.receipt_number).toBeTruthy();

  // Assert a payment history row was created for this fee
  const { data: paymentRow } = await supabase.from('hostel_fee_payments').select('*').eq('fee_id', feeToUse).eq('transaction_id', txn).maybeSingle();
  expect(paymentRow).toBeTruthy();
  expect(Number(paymentRow.amount_paid || paymentRow.amount || paymentRow.amount_paid)).toBeGreaterThanOrEqual(1);
});
