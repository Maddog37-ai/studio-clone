import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = process.env.GOOGLE_SHEETS_OVERALL_CSV_URL;
  if (!url) return NextResponse.json({ error: 'CSV URL not set' }, { status: 500 });

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch CSV' }, { status: 500 });

  const csv = await res.text();
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    const entry: any = {};
    headers.forEach((header, i) => { entry[header] = values[i]; });
    return entry;
  });

  return NextResponse.json({ data });
}
