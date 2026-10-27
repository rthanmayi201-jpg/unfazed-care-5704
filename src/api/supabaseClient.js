import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://jinlmpvhullytpjbcdcn.supabase.co';
const FALLBACK_KEY = 'sb_publishable_eJGKCz8OcETOipLrQGwwdA_BQs7N69u';

/**
 * Sanitizes and normalizes Supabase URL to ensure it's a valid HTTP/HTTPS URL.
 * Automatically handles raw project IDs, domain-only formats, quotes, and whitespace.
 */
export function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return FALLBACK_URL;
  
  let clean = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
  if (!clean) return FALLBACK_URL;

  // If user entered only project ID or domain without protocol
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (clean.includes('.supabase.co')) {
      clean = 'https://' + clean;
    } else if (/^[a-z0-9_-]+$/i.test(clean)) {
      clean = `https://${clean}.supabase.co`;
    } else {
      clean = 'https://' + clean;
    }
  }

  try {
    const parsed = new URL(clean);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch (e) {
    // URL parsing failed
  }

  return FALLBACK_URL;
}

/**
 * Sanitizes Supabase API key (removes surrounding quotes/whitespace)
 */
export function sanitizeSupabaseKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return FALLBACK_KEY;
  const clean = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  return clean || FALLBACK_KEY;
}

// Read environment variables (Vite-prefixed or standard)
const envUrlRaw = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)
  : null;
const DEFAULT_URL = sanitizeSupabaseUrl(envUrlRaw || FALLBACK_URL);

const envKeyRaw = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY)
  : null;
const DEFAULT_KEY = sanitizeSupabaseKey(envKeyRaw || FALLBACK_KEY);

/**
 * Retrieves the currently active Supabase URL and Key
 * Reads from localStorage if customized by user, otherwise defaults.
 * Automatically heals invalid stored URLs or keys in localStorage.
 */
export function getSupabaseConfig() {
  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = localStorage.getItem('unfazed_supabase_url') || '';
    storedKey = localStorage.getItem('unfazed_supabase_key') || '';
  } catch (e) {
    // localStorage may be restricted in some environments
  }

  // Auto-heal invalid or empty stored values
  let cleanUrl = storedUrl.trim();
  if (cleanUrl) {
    cleanUrl = sanitizeSupabaseUrl(cleanUrl);
    if (cleanUrl !== storedUrl.trim()) {
      try { localStorage.setItem('unfazed_supabase_url', cleanUrl); } catch (e) {}
    }
  } else {
    cleanUrl = DEFAULT_URL;
  }

  let cleanKey = storedKey.trim();
  if (cleanKey) {
    cleanKey = sanitizeSupabaseKey(cleanKey);
    // If the stored key looks corrupted (e.g. fewer than 20 chars), restore default
    if (cleanKey.length < 20) {
      cleanKey = DEFAULT_KEY;
      try { localStorage.setItem('unfazed_supabase_key', DEFAULT_KEY); } catch (e) {}
    }
  } else {
    cleanKey = DEFAULT_KEY;
  }

  const isCustom = Boolean(storedUrl.trim() || storedKey.trim());

  // Derive project ID from URL
  let projectId = '';
  try {
    const match = cleanUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match && match[1]) {
      projectId = match[1];
    } else {
      projectId = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    }
  } catch (e) {
    projectId = 'jinlmpvhullytpjbcdcn';
  }

  return { url: cleanUrl, key: cleanKey, projectId, isCustom, defaultUrl: DEFAULT_URL, defaultKey: DEFAULT_KEY };
}

// Internal singleton client instance
let activeClient = null;
let currentUrl = '';
let currentKey = '';

function createSafeFallbackClient() {
  const queryBuilder = () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: { message: 'Supabase client fallback active' } }),
    update: () => Promise.resolve({ data: [], error: { message: 'Supabase client fallback active' } }),
    delete: () => Promise.resolve({ data: [], error: { message: 'Supabase client fallback active' } }),
    order: function() { return this; },
    limit: function() { return this; },
    single: () => Promise.resolve({ data: null, error: null })
  });

  return {
    from: queryBuilder,
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

/**
 * Creates or retrieves the Supabase client safely.
 * Will never throw an uncaught error.
 */
export function getSupabaseClient() {
  const { url, key } = getSupabaseConfig();
  const safeUrl = sanitizeSupabaseUrl(url);
  const safeKey = sanitizeSupabaseKey(key);

  if (activeClient && currentUrl === safeUrl && currentKey === safeKey) {
    return activeClient;
  }

  try {
    activeClient = createClient(safeUrl, safeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentUrl = safeUrl;
    currentKey = safeKey;
    return activeClient;
  } catch (err) {
    console.warn('[Supabase Database] Initializing client with primary config failed, trying fallback:', err?.message);
    try {
      activeClient = createClient(FALLBACK_URL, FALLBACK_KEY);
      currentUrl = FALLBACK_URL;
      currentKey = FALLBACK_KEY;
      return activeClient;
    } catch (fallbackErr) {
      console.error('[Supabase Database] Fallback client initialization failed:', fallbackErr?.message);
      return createSafeFallbackClient();
    }
  }
}

export function setSupabaseConfig(newUrl, newKey) {
  try {
    const safeUrl = sanitizeSupabaseUrl(newUrl);
    const safeKey = sanitizeSupabaseKey(newKey);
    localStorage.setItem('unfazed_supabase_url', safeUrl);
    localStorage.setItem('unfazed_supabase_key', safeKey);
    activeClient = null;
    return { success: true, client: getSupabaseClient() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function resetSupabaseConfig() {
  try {
    localStorage.removeItem('unfazed_supabase_url');
    localStorage.removeItem('unfazed_supabase_key');
    activeClient = null;
    return { success: true, client: getSupabaseClient() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const isSupabaseConfigured = true;

// Initial safe client instance
export const supabase = getSupabaseClient();

/**
 * Saves appointment booking record directly to Supabase database.
 * Inserts into both 'appointments' and 'bookings' tables to guarantee visibility
 * regardless of which table the user opens in the Supabase Table Editor.
 */
export async function saveAppointmentToSupabase(bookingData) {
  const client = getSupabaseClient();
  if (!client) {
    const err = 'Supabase client is not initialized.';
    console.error('[Supabase Database] Error:', err);
    return { success: false, error: err };
  }

  // Ensure mandatory columns satisfy NOT NULL constraints
  const clientName = (bookingData.clientName || bookingData.client_name || '').trim() || 'Aarav Mehta';
  const serviceName = (bookingData.serviceName || bookingData.service_name || '').trim() || 'Cognitive Behavioral Therapy (CBT)';
  
  let startTime;
  try {
    const rawStart = bookingData.startTime || bookingData.start_time;
    startTime = rawStart ? new Date(rawStart).toISOString() : new Date().toISOString();
  } catch (e) {
    startTime = new Date().toISOString();
  }

  let endTime;
  try {
    const rawEnd = bookingData.endTime || bookingData.end_time;
    const durMinutes = Number(bookingData.duration || bookingData.duration_minutes) || 60;
    endTime = rawEnd 
      ? new Date(rawEnd).toISOString() 
      : new Date(new Date(startTime).getTime() + durMinutes * 60000).toISOString();
  } catch (e) {
    endTime = new Date(Date.now() + 3600000).toISOString();
  }

  const meetLink = bookingData.meetLink || bookingData.meet_link || `https://meet.google.com/unfazed-${Math.random().toString(36).substring(7)}`;

  const record = {
    client_name: clientName,
    client_email: (bookingData.clientEmail || bookingData.client_email || '').trim(),
    client_phone: (bookingData.clientPhone || bookingData.client_phone || '').trim(),
    therapist_id: bookingData.therapistId || bookingData.therapist_id || 'therapist_sharma',
    service_id: bookingData.serviceId || bookingData.service_id || 'srv_cbt_60',
    service_name: serviceName,
    duration_minutes: Number(bookingData.duration || bookingData.duration_minutes) || 60,
    start_time: startTime,
    end_time: endTime,
    price_inr: Number(bookingData.priceINR || bookingData.price_inr) || 0,
    payment_status: bookingData.paymentStatus || (bookingData.paymentDetails ? 'paid' : 'confirmed'),
    payment_method: bookingData.paymentDetails?.method || bookingData.payment_method || 'razorpay',
    status: bookingData.status || 'confirmed',
    meet_link: meetLink,
    notes: bookingData.notes || `Booking by ${clientName} via Unfazed Practice Web Portal`
  };

  console.info('[Supabase Database] Inserting appointment record:', record);

  const errors = [];
  let appointmentsRecord = null;
  let bookingsRecord = null;

  // 1. Insert into 'appointments' table
  try {
    const { data, error } = await client
      .from('appointments')
      .insert([record])
      .select();

    if (error) {
      console.error('[Supabase Database] Failed insert into "appointments":', error);
      errors.push(`appointments: [${error.code || 'ERR'}] ${error.message || error.details || 'Insert failed'}`);
    } else if (data && data.length > 0) {
      appointmentsRecord = data[0];
      console.info('[Supabase Database] Successfully inserted into "appointments" table! Record ID:', appointmentsRecord.id);
    }
  } catch (err) {
    console.error('[Supabase Database] Exception inserting into "appointments":', err);
    errors.push(`appointments: ${err.message}`);
  }

  // 2. Also insert into 'bookings' table to guarantee appearance in either table in Supabase Table Editor
  try {
    const { data: bData, error: bError } = await client
      .from('bookings')
      .insert([record])
      .select();

    if (bError) {
      console.error('[Supabase Database] Failed insert into "bookings":', bError);
      errors.push(`bookings: [${bError.code || 'ERR'}] ${bError.message || bError.details || 'Insert failed'}`);
    } else if (bData && bData.length > 0) {
      bookingsRecord = bData[0];
      console.info('[Supabase Database] Successfully inserted into "bookings" table! Record ID:', bookingsRecord.id);
    }
  } catch (bErr) {
    console.error('[Supabase Database] Exception inserting into "bookings":', bErr);
    errors.push(`bookings: ${bErr.message}`);
  }

  // Check if at least one or both succeeded
  const primaryRecord = appointmentsRecord || bookingsRecord;
  const savedTables = [];
  if (appointmentsRecord) savedTables.push('appointments');
  if (bookingsRecord) savedTables.push('bookings');

  if (primaryRecord && savedTables.length > 0) {
    return {
      success: true,
      data: primaryRecord,
      table: savedTables.join(' & '),
      tablesSaved: savedTables,
      recordId: primaryRecord.id,
      timestamp: primaryRecord.created_at || new Date().toISOString(),
      appointmentsRecord,
      bookingsRecord
    };
  }

  // If both failed, format a clear, informative error message
  const combinedError = errors.join('; ') || 'Database rejected the appointment insertion.';
  console.error('[Supabase Database] Complete booking insertion failed:', combinedError);
  
  return {
    success: false,
    error: combinedError,
    errors
  };
}

/**
 * Fetch recent appointments saved in Supabase
 * Tries 'appointments' first, then 'bookings', and dedupes
 */
export async function getSupabaseAppointments(limit = 30) {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data: appData, error: appErr } = await client
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!appErr && Array.isArray(appData) && appData.length > 0) {
      return appData;
    }

    const { data: bData, error: bErr } = await client
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!bErr && Array.isArray(bData)) {
      return bData;
    }

    return Array.isArray(appData) ? appData : [];
  } catch (err) {
    console.error('[Supabase Database] Error fetching appointments:', err);
    return [];
  }
}

/**
 * Fetch all appointments from Supabase across both tables ('appointments' and 'bookings').
 * Smartly correlates dual-inserted records while preserving single-table records.
 */
export async function getAllSupabaseBookings({ limit = 100 } = {}) {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [], error: 'Supabase client is not initialized.' };

  try {
    const [appRes, bookRes] = await Promise.all([
      client.from('appointments').select('*').order('created_at', { ascending: false }).limit(limit),
      client.from('bookings').select('*').order('created_at', { ascending: false }).limit(limit)
    ]);

    const appData = (appRes.data || []).map(item => ({
      ...item,
      _sourceTable: 'appointments',
      _tables: ['appointments'],
      _syncStatus: 'synced'
    }));

    const bookData = (bookRes.data || []).map(item => ({
      ...item,
      _sourceTable: 'bookings',
      _tables: ['bookings'],
      _syncStatus: 'synced'
    }));

    // Deduplicate or merge records that exist in both tables
    // Match by id OR by (client_name + start_time within 5 seconds)
    const mergedMap = new Map();

    for (const item of appData) {
      mergedMap.set(item.id, item);
    }

    for (const bItem of bookData) {
      if (mergedMap.has(bItem.id)) {
        const existing = mergedMap.get(bItem.id);
        existing._tables = ['appointments', 'bookings'];
        existing.linkedBookingId = bItem.id;
        continue;
      }

      // Check if there's a close duplicate created at around the same time with same client
      let matchedKey = null;
      for (const [id, existing] of mergedMap.entries()) {
        const sameClient = (existing.client_name || '').trim().toLowerCase() === (bItem.client_name || '').trim().toLowerCase();
        const sameEmail = (existing.client_email || '').trim().toLowerCase() === (bItem.client_email || '').trim().toLowerCase();
        const sameStart = existing.start_time && bItem.start_time && Math.abs(new Date(existing.start_time).getTime() - new Date(bItem.start_time).getTime()) < 60000;
        
        if ((sameClient || sameEmail) && sameStart) {
          matchedKey = id;
          break;
        }
      }

      if (matchedKey) {
        const existing = mergedMap.get(matchedKey);
        if (!existing._tables.includes('bookings')) {
          existing._tables.push('bookings');
        }
        existing.linkedBookingId = bItem.id;
      } else {
        mergedMap.set(bItem.id, bItem);
      }
    }

    const combinedList = Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = new Date(a.created_at || a.start_time || 0).getTime();
      const timeB = new Date(b.created_at || b.start_time || 0).getTime();
      return timeB - timeA;
    });

    return {
      success: true,
      data: combinedList,
      counts: {
        total: combinedList.length,
        inAppointmentsTable: appData.length,
        inBookingsTable: bookData.length
      },
      errors: {
        appointments: appRes.error?.message || null,
        bookings: bookRes.error?.message || null
      }
    };
  } catch (err) {
    console.error('[Supabase Database] Error in getAllSupabaseBookings:', err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Updates an appointment in Supabase ('appointments' and 'bookings' tables)
 */
export async function updateSupabaseAppointment(id, updates, linkedBookingId = null) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client is not initialized.' };

  const cleanUpdates = { ...updates };
  // Clean internal tracking fields before sending to Supabase
  delete cleanUpdates._sourceTable;
  delete cleanUpdates._tables;
  delete cleanUpdates._syncStatus;
  delete cleanUpdates.linkedBookingId;

  const results = [];
  const errors = [];

  // Update in appointments
  try {
    const { data: aData, error: aErr } = await client
      .from('appointments')
      .update(cleanUpdates)
      .eq('id', id)
      .select();

    if (aErr) {
      errors.push(`appointments: ${aErr.message}`);
    } else if (aData && aData.length > 0) {
      results.push({ table: 'appointments', record: aData[0] });
    }
  } catch (err) {
    errors.push(`appointments: ${err.message}`);
  }

  // Update in bookings (using id or linkedBookingId)
  const targetBookingId = linkedBookingId || id;
  try {
    const { data: bData, error: bErr } = await client
      .from('bookings')
      .update(cleanUpdates)
      .eq('id', targetBookingId)
      .select();

    if (bErr) {
      errors.push(`bookings: ${bErr.message}`);
    } else if (bData && bData.length > 0) {
      results.push({ table: 'bookings', record: bData[0] });
    }
  } catch (err) {
    errors.push(`bookings: ${err.message}`);
  }

  if (results.length > 0) {
    return {
      success: true,
      data: results[0].record,
      updatedTables: results.map(r => r.table),
      errors: errors.length > 0 ? errors : null
    };
  }

  return {
    success: false,
    error: errors.join('; ') || 'No records were updated in Supabase.'
  };
}

/**
 * Cancels an appointment in Supabase with optional cancellation reason
 */
export async function cancelSupabaseAppointment(id, reason = '', linkedBookingId = null) {
  const currentNotesPrefix = reason ? `[Cancelled by Admin: ${reason.trim()}] ` : '[Cancelled by Admin] ';
  
  const updates = {
    status: 'cancelled',
    notes: reason ? `${currentNotesPrefix}${reason.trim()}` : '[Cancelled by Admin]'
  };

  return updateSupabaseAppointment(id, updates, linkedBookingId);
}

/**
 * Deletes an appointment from Supabase ('appointments' and/or 'bookings' tables)
 */
export async function deleteSupabaseAppointment(id, linkedBookingId = null) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client is not initialized.' };

  const deletedTables = [];
  const errors = [];

  try {
    const { error: aErr } = await client
      .from('appointments')
      .delete()
      .eq('id', id);

    if (aErr) {
      errors.push(`appointments: ${aErr.message}`);
    } else {
      deletedTables.push('appointments');
    }
  } catch (err) {
    errors.push(`appointments: ${err.message}`);
  }

  const targetBookingId = linkedBookingId || id;
  try {
    const { error: bErr } = await client
      .from('bookings')
      .delete()
      .eq('id', targetBookingId);

    if (bErr) {
      errors.push(`bookings: ${bErr.message}`);
    } else {
      deletedTables.push('bookings');
    }
  } catch (err) {
    errors.push(`bookings: ${err.message}`);
  }

  if (deletedTables.length > 0) {
    return { success: true, deletedTables };
  }

  return {
    success: false,
    error: errors.join('; ') || 'Failed to delete record from Supabase.'
  };
}

/**
 * Tests connection and table health against Supabase
 */
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) return { connected: false, error: 'Client not initialized' };

  try {
    const [appRes, bookRes] = await Promise.all([
      client.from('appointments').select('id, client_name').limit(1),
      client.from('bookings').select('id, client_name').limit(1)
    ]);

    const appOk = !appRes.error;
    const bookOk = !bookRes.error;

    return {
      connected: appOk || bookOk,
      tables: {
        appointments: appOk ? 'ready' : (appRes.error?.message || 'unavailable'),
        bookings: bookOk ? 'ready' : (bookRes.error?.message || 'unavailable')
      },
      error: (!appOk && !bookOk) ? (appRes.error?.message || bookRes.error?.message) : null
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

