import { supabase } from '../config/supabase.js';

// Helper: Format a book row from Supabase back to camelCase MongoDB structure
const formatBook = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    _id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    isbn: b.isbn,
    publisher: b.publisher || '',
    edition: b.edition || '',
    totalCopies: b.quantity || b.total_copies || 1,
    availableCopies: b.available_quantity || b.available_copies || 0,
    language: b.language || '',
    shelfNumber: b.shelf_location || b.shelf_number || '',
    description: b.description || '',
    coverImage: b.cover_image || b.coverImage || '',
    isActive: b.is_active !== undefined ? b.is_active : true,
    createdAt: b.created_at
  };
};

// Helper: Update overdue status for all active issues whose due date has passed
const updateOverdueIssues = async () => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    await supabase
      .from('issued_books')
      .update({ status: 'Overdue' })
      .in('status', ['Issued', 'issued'])
      .lt('due_date', currentDate);
  } catch (error) {
    console.error('Error updating overdue issues:', error);
  }
};

/**
 * @desc   Add a new book
 * @route  POST /api/library/books
 */
export const addBook = async (req, res, next) => {
  try {
    const { title, author, category, isbn, publisher, edition, totalCopies, language, shelfNumber, description, coverImage } = req.body;
    if (!title || !author || !category || !isbn || !totalCopies) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }

    // Check duplicate ISBN
    const { data: existing } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', isbn)
      .maybeSingle();

    if (existing) {
      const err = new Error('ISBN already exists');
      err.statusCode = 400;
      return next(err);
    }

    const { data: book, error: createErr } = await supabase
      .from('books')
      .insert([{
        title,
        author,
        category,
        isbn,
        publisher,
        edition,
        quantity: Number(totalCopies),
        available_quantity: Number(totalCopies),
        language,
        shelf_location: shelfNumber,
        description,
        cover_image: coverImage,
        is_active: true
      }])
      .select()
      .single();

    if (createErr) throw createErr;

    res.status(201).json({ success: true, message: 'Book added', data: formatBook(book) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all books with filters & pagination
 */
export const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, author, category, availability } = req.query;

    let query = supabase.from('books').select('*', { count: 'exact' }).eq('is_active', true);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (author) {
      query = query.ilike('author', `%${author}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (availability === 'available') {
      query = query.gt('available_quantity', 0);
    } else if (availability === 'unavailable') {
      query = query.lte('available_quantity', 0);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const { data: booksData, count: total, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedBooks = booksData ? booksData.map(formatBook) : [];

    res.status(200).json({
      success: true,
      message: 'Books fetched',
      data: { books: formattedBooks, pagination: { total: total || 0, page: pageNum, limit: limitNum } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single book by ID
 */
export const getBookById = async (req, res, next) => {
  try {
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, message: 'Book fetched', data: formatBook(book) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a book
 */
export const updateBook = async (req, res, next) => {
  try {
    const { data: book, error: fetchErr } = await supabase
      .from('books')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }

    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.author) updateData.author = req.body.author;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.isbn) updateData.isbn = req.body.isbn;
    if (req.body.publisher) updateData.publisher = req.body.publisher;
    if (req.body.edition) updateData.edition = req.body.edition;

    if (req.body.totalCopies !== undefined) {
      const total = Number(req.body.totalCopies);
      const available = Number(book.available_quantity || 0);
      if (available > total) {
        const err = new Error('Cannot reduce totalCopies below current availableCopies');
        err.statusCode = 400;
        return next(err);
      }
      updateData.quantity = total;
      // Adjust available quantity by copies delta
      const delta = total - Number(book.quantity || 0);
      updateData.available_quantity = available + delta;
    }

    if (req.body.availableCopies !== undefined) {
      updateData.available_quantity = Number(req.body.availableCopies);
    }

    if (req.body.language) updateData.language = req.body.language;
    if (req.body.shelfNumber) updateData.shelf_location = req.body.shelfNumber;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.coverImage !== undefined) updateData.cover_image = req.body.coverImage;
    if (req.body.isActive !== undefined) updateData.is_active = req.body.isActive;

    const { data: updatedBook, error: updateErr } = await supabase
      .from('books')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({ success: true, message: 'Book updated', data: formatBook(updatedBook) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete a book (set isActive false)
 */
export const deleteBook = async (req, res, next) => {
  try {
    const { data: book, error: updateErr } = await supabase
      .from('books')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }

    res.status(200).json({ success: true, message: 'Book deactivated', data: null });
  } catch (error) {
    next(error);
  }
};

export const checkLibraryBooksDueTomorrow = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: issues, error } = await supabase
      .from('issued_books')
      .select('*, book:books(*)')
      .eq('due_date', tomorrowStr)
      .in('status', ['Issued', 'issued', 'Overdue', 'overdue']);

    if (error) throw error;
    if (!issues || issues.length === 0) return;

    for (const issue of issues) {
      if (!issue.student) continue;

      const { data: studentRecord } = await supabase
        .from('students')
        .select('*')
        .eq('id', issue.student)
        .maybeSingle();

      if (!studentRecord) continue;

      const studentId = studentRecord.id;
      const studentName = studentRecord.full_name;
      const studentEmail = studentRecord.email;
      const bookTitle = issue.book?.title || 'Borrowed Book';

      const notifTitle = `Library Book Return Reminder: '${bookTitle}' is due tomorrow.`;
      const { data: existing } = await supabase
        .from('student_notifications')
        .select('id')
        .eq('student_id', studentId)
        .eq('title', notifTitle)
        .maybeSingle();

      if (!existing) {
        const notifId = `SN-LIB-DUE-${Date.now()}-${issue.id}`;
        await supabase
          .from('student_notifications')
          .insert([{
            id: notifId,
            title: notifTitle,
            type: 'Library',
            priority: 'High',
            time: 'Just now',
            unread: true,
            student_id: studentId
          }]);

        if (studentEmail) {
          const { generateBookDueTemplate } = await import('../utils/emailTemplates.js');
          const { default: sendEmail } = await import('../utils/sendEmail.js');
          await sendEmail({
            to: studentEmail,
            subject: 'Library Book Return Reminder',
            html: generateBookDueTemplate(studentName, bookTitle, issue.due_date)
          });
        }
      }
    }
  } catch (err) {
    console.error('Error in checkLibraryBooksDueTomorrow:', err);
  }
};

/**
 * @desc   Issue a book to a student
 */
export const issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId, dueDate } = req.body;
    if (!studentId || !bookId || !dueDate) {
      const err = new Error('studentId, bookId and dueDate are required');
      err.statusCode = 400;
      return next(err);
    }

    // Validate student (retrieve email to verify profile and map to users.id if needed)
    const { data: studentRecord } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('is_active', true)
      .maybeSingle();

    if (!studentRecord) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }

    // Lookup user's ID in users table via email (since issued_books.user_id references users.id)
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('email', studentRecord.email)
      .maybeSingle();

    const targetUserId = userRecord ? userRecord.id : null;
    if (!targetUserId) {
      const err = new Error('Student user account not registered yet. Please have the student register first.');
      err.statusCode = 400;
      return next(err);
    }

    // Validate book
    const { data: book } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('is_active', true)
      .maybeSingle();

    if (!book) {
      const err = new Error('Book not found');
      err.statusCode = 404;
      return next(err);
    }

    if (Number(book.available_quantity || 0) <= 0) {
      const err = new Error('No copies available for this book');
      err.statusCode = 400;
      return next(err);
    }

    // Prevent duplicate active issue (status is 'Issued' or 'Overdue')
    const { data: existingIssue } = await supabase
      .from('issued_books')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('book', bookId)
      .in('status', ['Issued', 'Overdue', 'issued', 'overdue'])
      .maybeSingle();

    if (existingIssue) {
      const err = new Error('Student already has an active issue for this book');
      err.statusCode = 400;
      return next(err);
    }

    // Create issue record (saving standardized 'Issued' status)
    const { data: issued, error: issueErr } = await supabase
      .from('issued_books')
      .insert([{
        student: studentId, // also save studentId if needed
        book: bookId,
        user_id: targetUserId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(dueDate).toISOString().split('T')[0],
        status: 'Issued'
      }])
      .select()
      .single();

    if (issueErr) throw issueErr;

    // Decrement available copies
    const { error: decrErr } = await supabase
      .from('books')
      .update({ available_quantity: Number(book.available_quantity) - 1 })
      .eq('id', bookId);

    if (decrErr) throw decrErr;

    // Trigger notification for student
    const notifId = `SN-LIB-${Date.now()}`;
    await supabase
      .from('student_notifications')
      .insert([{
        id: notifId,
        title: `Book issued: '${book.title}' by ${book.author || 'Unknown'}. Due: ${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
        type: 'Library',
        priority: 'Medium',
        time: 'Just now',
        unread: true,
        student_id: studentId
      }]);

    if (studentRecord.email) {
      (async () => {
        try {
          const { default: sendEmail } = await import('../utils/sendEmail.js');
          const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Library Book Issued</h2>
              <p style="color: #334155; font-size: 15px;">Dear ${studentRecord.full_name},</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">You have successfully borrowed the book <strong>${book.title}</strong> by ${book.author || 'Unknown'} from the College Library.</p>
              <p style="color: #ef4444; font-weight: bold; font-size: 15px; line-height: 1.5;">Due Date: ${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
                Please return or renew the book on or before the due date to avoid overdue fines.
              </p>
              <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 20px; margin-bottom: 0;">College Library Administration</p>
            </div>
          `;
          await sendEmail({
            to: studentRecord.email,
            subject: `Book Issued: ${book.title}`,
            html: emailHtml
          });
        } catch (err) {
          console.error('Error sending book issue email:', err);
        }
      })();
    }

    res.status(201).json({
      success: true,
      message: 'Book issued',
      data: {
        ...issued,
        _id: issued.id,
        status: 'issued', // lowercase compatibility
        student: studentId,
        book: bookId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Return a book (by issue ID)
 */
export const returnBook = async (req, res, next) => {
  try {
    const { issueId } = req.params;

    const { data: issue, error: fetchErr } = await supabase
      .from('issued_books')
      .select('*, book:books(*)')
      .eq('id', issueId)
      .maybeSingle();

    if (!issue) {
      const err = new Error('Issue record not found');
      err.statusCode = 404;
      return next(err);
    }

    const currentStatus = String(issue.status).toLowerCase();
    if (currentStatus === 'returned') {
      const err = new Error('Book already returned');
      err.statusCode = 400;
      return next(err);
    }

    const now = new Date();
    // Auto-calculate fine based on overdue days (₹10/day)
    let fine = 0;
    const dueDate = new Date(issue.due_date);
    if (now > dueDate) {
      const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * 10;
    }

    // Allow librarian to override the fine with a custom amount from request body
    if (req.body && req.body.fineAmount !== undefined && req.body.fineAmount !== null) {
      const customFine = Number(req.body.fineAmount);
      if (!isNaN(customFine) && customFine >= 0) {
        fine = customFine;
      }
    }

    const { data: updatedIssue, error: updateErr } = await supabase
      .from('issued_books')
      .update({
        return_date: now.toISOString().split('T')[0],
        fine_amount: fine,
        status: 'Returned'
      })
      .eq('id', issueId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Increment book copies
    if (issue.book) {
      await supabase
        .from('books')
        .update({ available_quantity: Number(issue.book.available_quantity || 0) + 1 })
        .eq('id', issue.book.id);
    }

    // Trigger notification for student
    const returnNotifId = `SN-LIB-RET-${Date.now()}`;
    await supabase
      .from('student_notifications')
      .insert([{
        id: returnNotifId,
        title: `Book returned: '${issue.book?.title || 'Unknown'}'. Fine paid: ₹${fine}.`,
        type: 'Library',
        priority: 'Low',
        time: 'Just now',
        unread: true,
        student_id: issue.student
      }]);

    if (issue.student) {
      (async () => {
        try {
          const { data: studentRecord } = await supabase
            .from('students')
            .select('email, full_name')
            .eq('id', issue.student)
            .maybeSingle();

          if (studentRecord && studentRecord.email) {
            const { default: sendEmail } = await import('../utils/sendEmail.js');
            const emailHtml = `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">Library Book Returned</h2>
                <p style="color: #334155; font-size: 15px;">Dear ${studentRecord.full_name},</p>
                <p style="color: #334155; font-size: 15px; line-height: 1.5;">The borrowed book <strong>${issue.book?.title || 'Borrowed Book'}</strong> has been successfully marked as returned.</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.5;">Fine Amount Charged: ₹${fine}</p>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
                  Thank you for returning the book. Let us know if you want to borrow other materials.
                </p>
                <p style="color: #4f46e5; font-weight: 600; font-size: 14px; margin-top: 20px; margin-bottom: 0;">College Library Administration</p>
              </div>
            `;
            await sendEmail({
              to: studentRecord.email,
              subject: `Book Returned: ${issue.book?.title || 'Borrowed Book'}`,
              html: emailHtml
            });
          }
        } catch (err) {
          console.error('Error sending book return email:', err);
        }
      })();
    }

    res.status(200).json({
      success: true,
      message: 'Book returned',
      data: {
        ...updatedIssue,
        _id: updatedIssue.id,
        status: 'returned',
        book: issue.book ? formatBook(issue.book) : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete an issue record
 * @route  DELETE /api/library/issue/:issueId
 */
export const deleteIssueRecord = async (req, res, next) => {
  try {
    const { issueId } = req.params;

    const { data: issue, error: fetchErr } = await supabase
      .from('issued_books')
      .select('id, status, book:books(id, available_quantity)')
      .eq('id', issueId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!issue) {
      const err = new Error('Issue record not found');
      err.statusCode = 404;
      return next(err);
    }

    const currentStatus = String(issue.status || '').toLowerCase();

    if (currentStatus !== 'returned' && issue.book?.id) {
      const { error: restoreErr } = await supabase
        .from('books')
        .update({ available_quantity: Number(issue.book.available_quantity || 0) + 1 })
        .eq('id', issue.book.id);

      if (restoreErr) throw restoreErr;
    }

    const { error: deleteErr } = await supabase
      .from('issued_books')
      .delete()
      .eq('id', issueId);

    if (deleteErr) throw deleteErr;

    res.status(200).json({
      success: true,
      message: 'Issue record deleted',
      data: { id: issueId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get issued books (with filters)
 */
export const getIssuedBooks = async (req, res, next) => {
  try {
    await updateOverdueIssues();
    checkLibraryBooksDueTomorrow().catch(err => console.error('checkLibraryBooksDueTomorrow background error:', err));
    const { status, studentId } = req.query;

    let targetUserId = null;

    if (req.user.role === 'student') {
      targetUserId = req.user.id;
    } else if (req.user.role === 'parent') {
      const childEmailVal = req.user.child_email || req.user.childEmail;
      let childEmail = childEmailVal;
      if (!childEmail) {
        const { data: parentRecord } = await supabase
          .from('parents')
          .select('student_email')
          .eq('email', req.user.email)
          .maybeSingle();
        childEmail = parentRecord?.student_email;
      }
      if (childEmail) {
        const { data: studentRecord } = await supabase
          .from('students')
          .select('email')
          .eq('email', childEmail.toLowerCase().trim())
          .maybeSingle();
        if (studentRecord) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('email', studentRecord.email)
            .maybeSingle();
          targetUserId = userRecord ? userRecord.id : null;
        }
      }
    } else if (studentId) {
      const { data: studentRecord } = await supabase
        .from('students')
        .select('email')
        .eq('id', studentId)
        .maybeSingle();

      if (studentRecord) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('email', studentRecord.email)
          .maybeSingle();
        targetUserId = userRecord ? userRecord.id : null;
      }
    }

    // Use explicit FK hint `books!book` to avoid the column/alias naming collision
    // where the column named 'book' and the alias 'book' cause PostgREST to
    // return the raw UUID instead of the joined book object.
    let query = supabase.from('issued_books').select('*, bookData:books!book(id,title,author), user:users(*)');

    if (status) {
      const mapStatus = {
        'issued': 'Issued',
        'returned': 'Returned',
        'overdue': 'Overdue'
      };
      query = query.eq('status', mapStatus[status.toLowerCase()] || status);
    }

    if (studentId || req.user.role === 'student' || req.user.role === 'parent') {
      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      } else {
        return res.status(200).json({ success: true, message: 'Issued books fetched', data: [] });
      }
    }

    const { data: issues, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Cache students by email and ID for joining details
    const { data: students } = await supabase.from('students').select('*').eq('is_active', true);
    const studentMap = {};
    const studentMapById = {};
    if (students) {
      students.forEach(s => {
        studentMap[s.email] = s;
        studentMapById[s.id] = s;
      });
    }

    // Collect all unique book UUIDs for a fallback lookup in case the join fails
    const bookIds = [...new Set(
      (issues || []).map(item => {
        // item.book holds the raw UUID (the FK column), item.bookData holds the joined object
        const rawBookId = typeof item.book === 'string' ? item.book : null;
        return rawBookId;
      }).filter(Boolean)
    )];

    const bookMap = {};
    if (bookIds.length > 0) {
      const { data: bookRows } = await supabase
        .from('books')
        .select('id, title, author')
        .in('id', bookIds);
      if (bookRows) {
        bookRows.forEach(b => { bookMap[b.id] = b; });
      }
    }

    const formattedIssues = issues ? issues.map(item => {
      const userEmail = item.user?.email;
      const childProfile = (item.student ? studentMapById[item.student] : null) || (userEmail ? studentMap[userEmail] : null);

      // Resolve book data: prefer the joined object, fall back to the manual lookup map
      const joinedBook = item.bookData && typeof item.bookData === 'object' ? item.bookData : null;
      const rawBookId = typeof item.book === 'string' ? item.book : (joinedBook ? joinedBook.id : null);
      const fallbackBook = rawBookId ? bookMap[rawBookId] : null;
      const resolvedBook = joinedBook || fallbackBook;

      return {
        id: item.id,
        _id: item.id,
        issueDate: item.issue_date || (item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        dueDate: item.due_date,
        returnDate: item.return_date,
        status: String(item.status).toLowerCase(),
        fineAmount: Number(item.fine_amount || 0),
        book: resolvedBook ? {
          _id: resolvedBook.id,
          id: resolvedBook.id,
          title: resolvedBook.title || 'Unknown Book',
          author: resolvedBook.author || ''
        } : null,
        student: childProfile ? {
          _id: childProfile.id,
          id: childProfile.id,
          fullName: childProfile.full_name,
          rollNumber: childProfile.roll_number,
          department: childProfile.department
        } : (item.user ? {
          fullName: item.user.full_name || item.user.name,
          rollNumber: 'N/A',
          department: 'N/A'
        } : null)
      };
    }) : [];

    res.status(200).json({ success: true, message: 'Issued books fetched', data: formattedIssues });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Generate library report
 */
export const getLibraryReport = async (req, res, next) => {
  try {
    await updateOverdueIssues();

    // 1. Total books
    const { count: totalBooks } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 2. Total active issues
    const { count: totalIssued } = await supabase
      .from('issued_books')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Issued', 'issued', 'Overdue', 'overdue']);

    // 3. Overdue count
    const { count: overdueCount } = await supabase
      .from('issued_books')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Overdue', 'overdue']);

    // 4. Total fine collected
    const { data: fineData } = await supabase
      .from('issued_books')
      .select('fine_amount')
      .in('status', ['Returned', 'returned']);
    const totalFines = fineData ? fineData.reduce((sum, item) => sum + Number(item.fine_amount || 0), 0) : 0;

    // 5. Category analytics (with checkouts)
    const { data: allBooks } = await supabase.from('books').select('category').eq('is_active', true);
    const { data: allIssuesWithBooks } = await supabase
      .from('issued_books')
      .select('status, book:books(category)');

    const categoryMap = {};
    if (allBooks) {
      allBooks.forEach(b => {
        const cat = b.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { totalBooks: 0, issued: 0, returned: 0, active: 0 };
        }
        categoryMap[cat].totalBooks += 1;
      });
    }

    if (allIssuesWithBooks) {
      allIssuesWithBooks.forEach(issue => {
        const cat = issue.book?.category || 'Uncategorized';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { totalBooks: 0, issued: 0, returned: 0, active: 0 };
        }
        categoryMap[cat].issued += 1;
        const status = String(issue.status).toLowerCase();
        if (status === 'returned') {
          categoryMap[cat].returned += 1;
        } else {
          categoryMap[cat].active += 1;
        }
      });
    }

    const categoryAnalytics = Object.keys(categoryMap).map(cat => {
      const data = categoryMap[cat];
      return {
        _id: cat,
        count: data.totalBooks,
        issued: data.issued,
        returned: data.returned,
        active: data.active
      };
    });

    // 6. Most issued books (top 5)
    const { data: allIssues } = await supabase.from('issued_books').select('book');
    const issueCounts = {};
    if (allIssues) {
      allIssues.forEach(i => {
        if (i.book) {
          issueCounts[i.book] = (issueCounts[i.book] || 0) + 1;
        }
      });
    }

    const topBookIds = Object.keys(issueCounts)
      .sort((a, b) => issueCounts[b] - issueCounts[a])
      .slice(0, 5);

    const mostIssuedBooks = [];
    if (topBookIds.length > 0) {
      const { data: bookDetails } = await supabase.from('books').select('id, title, author, available_quantity').in('id', topBookIds);
      if (bookDetails) {
        topBookIds.forEach(id => {
          const book = bookDetails.find(b => b.id === id);
          if (book) {
            mostIssuedBooks.push({
              bookId: book.id,
              title: book.title,
              author: book.author,
              availableQuantity: Number(book.available_quantity || 0),
              issueCount: issueCounts[id]
            });
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Library report generated',
      data: {
        totals: {
          totalBooks: totalBooks || 0,
          totalIssued: totalIssued || 0,
          overdueCount: overdueCount || 0,
          totalFines
        },
        categoryAnalytics,
        mostIssuedBooks
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Format ebook
 */
const formatEBook = (e) => {
  if (!e) return null;
  return {
    id: e.id,
    _id: e.id,
    title: e.title,
    author: e.author,
    category: e.category,
    format: e.format,
    size: e.size,
    downloads: e.downloads || 0,
    fileUrl: e.file_url || '',
    createdAt: e.created_at
  };
};

/**
 * @desc   Get all ebooks with optional search and category filters
 */
export const getEBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = supabase.from('ebooks').select('*');

    if (category && category !== 'All') {
      query = query.ilike('category', `%${category}%`);
    }

    const { data: ebooks, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    let filtered = ebooks;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = ebooks.filter(e => 
        e.title.toLowerCase().includes(lowerSearch) ||
        e.author.toLowerCase().includes(lowerSearch)
      );
    }

    res.status(200).json({
      success: true,
      message: 'EBooks fetched successfully',
      data: {
        ebooks: filtered.map(formatEBook)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add a new ebook
 */
export const addEBook = async (req, res, next) => {
  try {
    const { title, author, category, format, size, fileUrl } = req.body;
    if (!title || !author || !category || !size) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }

    const { data: ebook, error } = await supabase
      .from('ebooks')
      .insert([{
        title,
        author,
        category,
        format: format || 'PDF',
        size,
        file_url: fileUrl || '',
        downloads: 0
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'EBook created successfully',
      data: formatEBook(ebook)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update an ebook
 */
export const updateEBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, author, category, format, size, fileUrl } = req.body;

    const { data: ebook, error } = await supabase
      .from('ebooks')
      .update({
        title,
        author,
        category,
        format,
        size,
        file_url: fileUrl,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'EBook updated successfully',
      data: formatEBook(ebook)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete an ebook
 */
export const deleteEBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('ebooks').delete().eq('id', id);
    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'EBook deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Increment download count for an ebook
 */
export const downloadEBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch current download count
    const { data: current, error: fetchErr } = await supabase
      .from('ebooks')
      .select('downloads')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!current) {
      const err = new Error('EBook not found');
      err.statusCode = 404;
      return next(err);
    }

    const newDownloads = (current.downloads || 0) + 1;

    const { data: updated, error: updateErr } = await supabase
      .from('ebooks')
      .update({ downloads: newDownloads })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.status(200).json({
      success: true,
      message: 'EBook download counted',
      data: formatEBook(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all library notifications
 * @route  GET /api/library/notifications
 */
export const getLibraryNotifications = async (req, res, next) => {
  try {
    const { data: notifications, error } = await supabase
      .from('library_notifications')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add a library notification
 * @route  POST /api/library/notifications
 */
export const addLibraryNotification = async (req, res, next) => {
  try {
    const { title, message, type, urgency } = req.body;
    if (!title || !message || !type) {
      const err = new Error('Missing required fields');
      err.statusCode = 400;
      return next(err);
    }

    const { data: notification, error } = await supabase
      .from('library_notifications')
      .insert([{
        title,
        message,
        type,
        urgency: urgency || 'medium',
        unread: true,
        is_archived: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Notification dispatched',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Mark a library notification as read
 * @route  PUT /api/library/notifications/:id/read
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: notification, error } = await supabase
      .from('library_notifications')
      .update({ unread: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Archive a library notification
 * @route  PUT /api/library/notifications/:id/archive
 */
export const archiveNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: notification, error } = await supabase
      .from('library_notifications')
      .update({ is_archived: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Notification archived',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get library settings
 * @route  GET /api/library/settings
 */
export const getLibrarySettings = async (req, res, next) => {
  try {
    const { data: settings, error } = await supabase
      .from('library_settings')
      .select('*')
      .eq('key', 'channel_preferences')
      .maybeSingle();

    if (error) throw error;

    // Return default settings if none exist
    const defaultSettings = [
      { title: "Due Date Reminders", enabled: true, desc: "Get notified when books are due within 3 days" },
      { title: "Overdue Alerts", enabled: true, desc: "Critical alerts for overdue books" },
      { title: "New Arrivals", enabled: true, desc: "Notify about newly added books" },
      { title: "Fine Reminders", enabled: true, desc: "Payment reminders for pending fines" },
      { title: "System Updates", enabled: false, desc: "Maintenance and system notifications" }
    ];

    res.status(200).json({
      success: true,
      data: settings ? settings.value : defaultSettings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update library settings
 * @route  PUT /api/library/settings
 */
export const updateLibrarySettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings) {
      const err = new Error('Settings data required');
      err.statusCode = 400;
      return next(err);
    }

    const { data: updated, error } = await supabase
      .from('library_settings')
      .upsert({
        key: 'channel_preferences',
        value: settings,
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Settings updated',
      data: updated.value
    });
  } catch (error) {
    next(error);
  }
};
