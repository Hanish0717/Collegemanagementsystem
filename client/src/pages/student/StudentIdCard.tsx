import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Award,
  Calendar,
  CreditCard,
  Download,
  Mail,
  Printer,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Plus,
  RefreshCw,
  Clock,
  User,
  DollarSign,
  Briefcase,
  Heart,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Lock,
  Unlock,
  MapPin,
  Check
} from 'lucide-react';
import { Card, PageHeader, Badge } from '@/components/dashboard/ui';
import api from '@/lib/api';
import {
  fetchIDCardStudentProfile,
  createIDCardRequest,
  collectIDCardPayment,
  updateIDCardStatus,
  reportMissingIDCard
} from '@/services/libraryService';

export function StudentIdCard() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [idCardData, setIdCardData] = useState<any>(null);
  
  // Tab/Screen states
  const [viewMode, setViewMode] = useState<'view' | 'request' | 'payment'>('view');
  
  // Card Flip State
  const [isFlipped, setIsFlipped] = useState(false);

  // Request Form State
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256');
  const [signatureUrl, setSignatureUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png');
  const [requestReason, setRequestReason] = useState('Initial card issue');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [txnId, setTxnId] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [latestReceipt, setLatestReceipt] = useState<any>(null);

  // Load student dashboard profile first, then load ID card status details
  const loadData = async () => {
    setLoading(true);
    try {
      const dashRes = await api.get('/api/student-module/dashboard');
      if (dashRes.data?.success && dashRes.data?.data?.profile) {
        const profile = dashRes.data.data.profile;
        setStudentInfo(profile);
        
        // Load card profile
        const studentId = profile.id || profile._id;
        const cardRes = await fetchIDCardStudentProfile(studentId);
        setIdCardData(cardRes);
        
        // Fill form fields if parent details exist
        if (cardRes.student) {
          setFatherName(cardRes.student.parentName || '');
          setParentPhone(cardRes.student.parentPhone || '');
        }
      }
    } catch (err) {
      console.error('Error loading student ID card context:', err);
      toast.error('Failed to load ID card module details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent, type: 'New' | 'Duplicate' | 'Renew') => {
    e.preventDefault();
    if (!studentInfo) return;

    if (type === 'New' && (!fatherName || !motherName || !parentPhone)) {
      toast.error('Please enter all required parent details for verification');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createIDCardRequest({
        studentId: studentInfo.id || studentInfo._id,
        requestType: type,
        reason: requestReason
      });

      toast.success(`${type} ID Card request generated successfully!`);
      await loadData();
      
      // If payment is required (for Duplicate or Renew Replacement fee)
      if (res.payment_status === 'Pending') {
        setViewMode('payment');
        setCheckoutStep(1);
      } else {
        setViewMode('view');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit card request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutPayment = async () => {
    if (!idCardData?.requests) return;
    
    // Find latest pending payment request
    const pendingReq = idCardData.requests.find((r: any) => r.payment_status === 'Pending');
    if (!pendingReq) {
      toast.error('No pending fee collection found');
      return;
    }

    setSubmitting(true);
    try {
      const referenceId = txnId || `UPI-${Math.floor(100000 + Math.random() * 900000)}`;
      const totalAmountWithGst = 167.00; // ₹150 + ₹27 GST - ₹10 discount

      const payData = await collectIDCardPayment({
        requestId: pendingReq.id,
        amount: totalAmountWithGst,
        paymentMethod,
        transactionId: referenceId
      });

      toast.success('Fee replacement payment processed successfully!');
      setLatestReceipt(payData.receipt);
      setCheckoutStep(3);
      await loadData();
    } catch (err: any) {
      toast.error('Payment verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportLost = async () => {
    if (!idCardData?.idCards || !studentInfo) return;
    const activeCard = idCardData.idCards.find((c: any) => c.status === 'Active');
    if (!activeCard) return;

    if (!window.confirm('WARNING: Reporting this card as lost will IMMEDIATELY block and deactivate it for campus entry. Proceed?')) {
      return;
    }

    try {
      await reportMissingIDCard({
        studentId: studentInfo.id || studentInfo._id,
        cardId: activeCard.id,
        remarks: 'Reported lost via Student Self-Service Portal'
      });
      toast.success('Your card has been blocked. You can now request a duplicate replacement.');
      await loadData();
    } catch (err) {
      toast.error('Failed to report missing card');
    }
  };

  const handleRenewCard = async () => {
    if (!idCardData?.idCards || !studentInfo) return;
    const activeCard = idCardData.idCards.find((c: any) => c.status === 'Active');
    if (!activeCard) return;

    if (!window.confirm('Confirm card renewal request?')) {
      return;
    }

    setRequestReason('Scheduled periodic course term renewal');
    // Generate request
    setSubmitting(true);
    try {
      const res = await createIDCardRequest({
        studentId: studentInfo.id || studentInfo._id,
        requestType: 'Renew',
        reason: 'Course period renewal'
      });
      toast.success('Renewal request filed! Complete replacement charge payment.');
      await loadData();
      if (res.payment_status === 'Pending') {
        setViewMode('payment');
        setCheckoutStep(1);
      }
    } catch (err) {
      toast.error('Failed to initiate renewal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    toast.success('Your digital student ID card PDF bundle download has started!');
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Student_ID_Card_${studentInfo?.rollNumber}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-sm text-gray-500">Loading your ID Card information...</span>
        </div>
      </div>
    );
  }

  // Derived state values
  const activeCard = idCardData?.idCards?.find((c: any) => c.status === 'Active');
  const blockedCard = idCardData?.idCards?.find((c: any) => c.status === 'Blocked');
  const lostCard = idCardData?.idCards?.find((c: any) => c.status === 'Lost');
  const pendingRequest = idCardData?.requests?.find((r: any) => r.status === 'Pending');
  const rejectedRequest = idCardData?.requests?.find((r: any) => r.status === 'Rejected');

  // Verify status stepper progress
  const getStepStatus = () => {
    if (activeCard) return { step: 4, label: 'Issued & Active' };
    if (pendingRequest) {
      if (pendingRequest.payment_status === 'Pending') {
        return { step: 2, label: 'Awaiting Replacement Fee' };
      }
      return { step: 1, label: 'Submitted & Under Verification' };
    }
    if (rejectedRequest) return { step: -1, label: `Rejected: ${rejectedRequest.rejection_reason}` };
    return { step: 0, label: 'Not Requested' };
  };

  const currentStep = getStepStatus();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="My Digital ID Card 🪪"
        desc="View, request, print, renew or report lost your official student identity card."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stepper & Action Controls (Left 1 col) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Stepper Card */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              ID Card Lifecycle Status
            </h3>

            {/* Stepper Visualization */}
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-200">
              {/* Step 1: Requested */}
              <div className="flex gap-3 items-start relative">
                <div className={`p-1 rounded-full shrink-0 border z-10 ${
                  currentStep.step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Request Submitted</div>
                  <div className="text-[10px] text-gray-400">Verifies data with ERP database.</div>
                </div>
              </div>

              {/* Step 2: Verification */}
              <div className="flex gap-3 items-start relative">
                <div className={`p-1 rounded-full shrink-0 border z-10 ${
                  currentStep.step >= 1 && pendingRequest?.payment_status !== 'Pending' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Administrative Verification</div>
                  <div className="text-[10px] text-gray-400">Check photo, course registration & fees.</div>
                </div>
              </div>

              {/* Step 3: Payment */}
              <div className="flex gap-3 items-start relative">
                <div className={`p-1 rounded-full shrink-0 border z-10 ${
                  currentStep.step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">Fee Replacement Payment</div>
                  <div className="text-[10px] text-gray-400">₹150 duplicate printing charge.</div>
                </div>
              </div>

              {/* Step 4: Issued */}
              <div className="flex gap-3 items-start relative">
                <div className={`p-1 rounded-full shrink-0 border z-10 ${
                  currentStep.step >= 4 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">ID Issued & Active</div>
                  <div className="text-[10px] text-gray-400">Card barcode linked to Library module.</div>
                </div>
              </div>
            </div>

            {/* Sub-status label */}
            <div className="mt-6 pt-4 border-t border-gray-150">
              <div className="text-xs text-gray-400">Current Status:</div>
              <div className="mt-1">
                {currentStep.step === -1 ? (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0" /> {currentStep.label}
                  </div>
                ) : currentStep.step === 4 ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 shrink-0" /> ACTIVE & VERIFIED
                  </div>
                ) : currentStep.step > 0 ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 shrink-0" /> {currentStep.label}
                  </div>
                ) : (
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> No Card Request Registered
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-4 space-y-2">
              {currentStep.step === 0 && (
                <button
                  onClick={() => setViewMode('request')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-xs shadow transition"
                >
                  Submit ID Card Request
                </button>
              )}
              {currentStep.step === 2 && pendingRequest?.payment_status === 'Pending' && (
                <button
                  onClick={() => setViewMode('payment')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-medium text-xs shadow transition flex items-center justify-center gap-1"
                >
                  <DollarSign className="h-4 w-4" /> Pay Replacement Fee (₹150)
                </button>
              )}
              {activeCard && (
                <>
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-medium text-xs shadow transition flex items-center justify-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Download PDF Card
                  </button>
                  <button
                    onClick={handleRenewCard}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-xs shadow transition flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" /> Request Card Renewal
                  </button>
                  <button
                    onClick={handleReportLost}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-xs shadow transition flex items-center justify-center gap-1"
                  >
                    <AlertTriangle className="h-4 w-4" /> Report Lost / Stolen
                  </button>
                </>
              )}
              {lostCard && !pendingRequest && (
                <button
                  onClick={() => {
                    setRequestReason('Lost replacement requested');
                    setViewMode('request');
                  }}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-medium text-xs shadow transition flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Apply for Duplicate Card
                </button>
              )}
            </div>
          </Card>

          {/* Library Membership Rules Widget */}
          <Card>
            <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">Library Guidelines</h4>
            <div className="space-y-2 text-[11px] text-gray-500 leading-relaxed">
              <div>• Books are issued for a maximum period of 14 days.</div>
              <div>• Delayed returns attract a fine of ₹5.00 per overdue day.</div>
              <div>• Show your ID Card at the counter for checkout registration.</div>
              <div>• Duplicate card processing requires a ₹150 replacement fee.</div>
            </div>
          </Card>
        </div>

        {/* Dynamic Display Panel (Right 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {viewMode === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* 1. Realistic Digital ID Card Mockup */}
                {activeCard ? (
                  <div className="flex flex-col items-center space-y-4">
                    <span className="text-xs text-gray-400 font-medium">Click Card to Flip / Show Instructions</span>
                    
                    {/* Card container */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="relative w-[340px] h-[215px] cursor-pointer perspective-1000"
                    >
                      <div 
                        className={`w-full h-full duration-700 preserve-3d relative ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                      >
                        {/* FRONT SIDE */}
                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-2xl p-4 border border-blue-800 flex flex-col justify-between overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                          
                          {/* Header */}
                          <div className="flex items-center gap-2 border-b border-blue-800/60 pb-2">
                            <div className="bg-white p-1 rounded">
                              <Award className="h-5 w-5 text-blue-900" />
                            </div>
                            <div>
                              <div className="text-xs font-bold tracking-widest uppercase">Apex Technology Institute</div>
                              <div className="text-[8px] tracking-wider text-blue-300">STUDENT ID CARD</div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="flex gap-4 items-center flex-1 my-3">
                            <img
                              src={photoUrl}
                              alt="Student"
                              className="w-[70px] h-[85px] rounded object-cover border border-blue-400/50"
                            />
                            <div className="flex-1 space-y-1 text-xs">
                              <div className="text-[13px] font-bold truncate text-white">{studentInfo?.fullName || 'Student'}</div>
                              <div className="text-blue-200">Roll No: {studentInfo?.rollNumber}</div>
                              <div className="text-blue-300">Dept: {studentInfo?.department}</div>
                              <div className="text-blue-300 text-[10px]">Valid Till: {new Date(activeCard.expiry_date).toLocaleDateString()}</div>
                            </div>
                            
                            {/* QR Code */}
                            <div className="bg-white p-1 rounded shadow-inner">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=${encodeURIComponent(activeCard.qr_code || '')}`}
                                alt="QR"
                                className="h-[52px] w-[52px]"
                              />
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center text-[8.5px] text-blue-300 border-t border-blue-800/40 pt-1.5">
                            <div>Card No: {activeCard.card_number}</div>
                            <div className="font-semibold text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="h-2.5 w-2.5" /> ACTIVE
                            </div>
                          </div>
                        </div>

                        {/* BACK SIDE */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-indigo-900 flex flex-col justify-between overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
                          
                          {/* Instructions */}
                          <div className="space-y-1.5 text-[8.5px] text-slate-300 leading-normal">
                            <div className="font-bold text-white uppercase text-[9px] tracking-wide mb-1">Terms & Library Rules</div>
                            <div>• Display this card during checks on campus and library desks.</div>
                            <div>• Delayed book checkins attract standard daily fines.</div>
                            <div>• Loss of card must be reported immediately to deactivate.</div>
                          </div>

                          {/* Signature & Barcode */}
                          <div className="flex justify-between items-end gap-4 mt-2">
                            {/* Barcode lines */}
                            <div className="bg-white p-1 rounded flex flex-col items-center">
                              <div className="flex items-center h-[30px] w-[120px] bg-white gap-[1.5px] px-1">
                                {[3,1,2,4,1,3,2,1,4,2,3,1,2,4,1].map((w, idx) => (
                                  <div key={idx} className="bg-black h-full" style={{ width: `${w}px` }} />
                                ))}
                              </div>
                              <div className="text-[7px] font-mono text-black tracking-widest mt-0.5">
                                {activeCard.barcode}
                              </div>
                            </div>

                            {/* Authority Sign */}
                            <div className="text-center pb-0.5">
                              <div className="font-serif italic text-[11px] text-slate-300 select-none">M. K. Sharma</div>
                              <div className="border-t border-slate-600 pt-0.5 text-[6.5px] uppercase tracking-wider text-slate-400 font-bold">Librarian</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-white shadow-sm">
                    <CreditCard className="h-10 w-10 mb-3 text-gray-300 animate-bounce" />
                    <h3 className="font-semibold text-gray-700">No Active Student ID Card</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      {currentStep.step === 1 ? (
                        'Your ID Card request has been successfully submitted and is under administrative review.'
                      ) : currentStep.step === 2 ? (
                        'Your duplicate request is approved! Please complete the replacement fee payment to issue.'
                      ) : (
                        'Complete the profile information form below to register and request your official Student ID Card.'
                      )}
                    </p>
                  </div>
                )}

                {/* 2. Payment History Logs table */}
                <Card>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    My Card Replacement Payment History
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Amt Paid</th>
                          <th className="px-4 py-2">Method</th>
                          <th className="px-4 py-2">Transaction ID</th>
                          <th className="px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {idCardData?.payments?.map((pay: any) => (
                          <tr key={pay.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{new Date(pay.payment_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 font-bold text-gray-900">₹{pay.amount}</td>
                            <td className="px-4 py-2">{pay.payment_method}</td>
                            <td className="px-4 py-2 font-mono text-xs">{pay.transaction_id || 'N/A'}</td>
                            <td className="px-4 py-2">
                              <Badge variant={pay.payment_status === 'Paid' ? 'success' : 'warning'}>
                                {pay.payment_status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        {(!idCardData?.payments || idCardData.payments.length === 0) && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-400">
                              No card-related replacement fees logged.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {viewMode === 'request' && (
              <motion.div
                key="request"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Submit ID Card Registration Request</h3>
                    <button onClick={() => setViewMode('view')} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                      Cancel & Return
                    </button>
                  </div>

                  <form onSubmit={(e) => handleRequestSubmit(e, activeCard || lostCard ? 'Duplicate' : 'New')} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Readonly fields from ERP */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={studentInfo?.fullName || ''}
                          disabled
                          className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Roll Number</label>
                        <input
                          type="text"
                          value={studentInfo?.rollNumber || ''}
                          disabled
                          className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Department</label>
                        <input
                          type="text"
                          value={studentInfo?.department || ''}
                          disabled
                          className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-lg text-sm text-gray-500"
                        />
                      </div>

                      {/* Required editable inputs */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Blood Group</label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Father's Name</label>
                        <input
                          type="text"
                          required
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value)}
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Mother's Name</label>
                        <input
                          type="text"
                          required
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value)}
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Emergency Parent Mobile</label>
                        <input
                          type="tel"
                          required
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase block mb-1">Upload Photo (Simulation)</label>
                        <div className="flex gap-3 items-center">
                          <img src={photoUrl} className="h-10 w-10 rounded-full object-cover border" alt="Student preview" />
                          <input
                            type="text"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            className="flex-1 border border-gray-300 p-2 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setViewMode('view')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Register & File Request'}
                      </button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {viewMode === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Duplicate Replacement Checkout Payment</h3>
                    <button onClick={() => setViewMode('view')} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                      Close
                    </button>
                  </div>

                  {checkoutStep === 1 && (
                    <div className="space-y-4">
                      {/* Breakup Invoice */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 text-sm">
                        <div className="p-3 border-b bg-gray-150 font-semibold text-gray-700 flex justify-between">
                          <span>Replacement Fee Breakup</span>
                          <span className="font-mono">Invoice Reference</span>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Duplicate Printing Fee:</span>
                            <span className="font-medium">₹150.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">GST (18%):</span>
                            <span className="font-medium">₹27.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Online Student Discount:</span>
                            <span className="font-medium text-emerald-600">-₹10.00</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                            <span>Total Due Amount:</span>
                            <span>₹167.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Select Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white"
                          >
                            <option value="UPI / QR Code">UPI / QR Code</option>
                            <option value="Credit / Debit Card">Credit / Debit Card</option>
                            <option value="Netbanking">Netbanking</option>
                          </select>
                        </div>

                        {paymentMethod === 'UPI / QR Code' && (
                          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-dashed">
                            <span className="text-xs text-gray-500 mb-2">Scan QR code using GooglePay, PhonePe, or BHIM UPI</span>
                            {/* Dummy QR Code for UPI checkout */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=apexlibrary@sbi&pn=Apex%20Library&am=167.00`}
                              alt="UPI QR Code"
                              className="h-[120px] w-[120px] border p-2 bg-white rounded-lg shadow-sm"
                            />
                            <span className="text-xs font-semibold text-gray-800 mt-2">Pay: ₹167.00</span>
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Transaction Ref ID / Reference</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter 12-digit transaction number"
                            value={txnId}
                            onChange={(e) => setTxnId(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => setViewMode('view')}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCheckoutPayment}
                          disabled={submitting || !txnId}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          {submitting ? 'Verifying...' : 'Verify & Pay Fee'}
                        </button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 3 && latestReceipt && (
                    <div className="space-y-4 text-center">
                      <div className="inline-flex p-3 bg-emerald-100 rounded-full text-emerald-600">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">Payment Confirmed!</h4>
                      <p className="text-xs text-gray-500">
                        Your transaction has been processed. The duplicate ID Card request is now auto-approved and queued for printing.
                      </p>

                      {/* Receipt Display */}
                      <div className="max-w-xs mx-auto border p-4 rounded-xl text-left bg-gray-50 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Receipt No:</span>
                          <span className="font-mono font-bold text-gray-800">{latestReceipt.receipt_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date Paid:</span>
                          <span className="text-gray-800">{new Date(latestReceipt.generated_at).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount Charged:</span>
                          <span className="font-bold text-gray-800">₹167.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-gray-800">{paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-3 pt-4 border-t">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
                        >
                          <Printer className="h-4 w-4" /> Print Receipt
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('view');
                            setLatestReceipt(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                        >
                          Finish & Close
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default StudentIdCard;
