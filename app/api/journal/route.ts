import { NextRequest, NextResponse } from 'next/server';
import { postJournalEntry } from '@/lib/accounting';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { date, description, reference, lines } = body;

        // Validate input
        if (!date || !description || !lines || !Array.isArray(lines)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Post journal entry
        const entry = await postJournalEntry({
            date: new Date(date),
            description,
            reference,
            lines,
            status: 'POSTED'
        });

        return NextResponse.json({ success: true, entry }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create journal entry' },
            { status: 400 }
        );
    }
}
