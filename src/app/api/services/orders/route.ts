import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_name, email, service_type, budget, description } = body;

    if (!client_name || !email || !service_type) {
      return NextResponse.json(
        { error: 'Name, email, and service type are required.' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('service_orders')
      .insert({
        client_name,
        email,
        service_type,
        budget: budget || 'Not specified',
        description: description || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Order insert error:', error);
      const message = error.code === '42P01'
        ? 'The orders table has not been set up yet. Please run the SQL migration in supabase/00003_service_orders.sql in your Supabase dashboard.'
        : 'Failed to submit your order. Please try again.';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Order submitted successfully! I will get back to you soon.',
      order: data,
    });
  } catch (err) {
    console.error('Order API error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
