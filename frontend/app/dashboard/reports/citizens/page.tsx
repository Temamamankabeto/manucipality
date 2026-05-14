"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCitizenReportQuery } from "@/hooks";

type ReportName = "gender-distribution" | "age-distribution" | "households" | "registration-trends" | "suspended";

export default function CitizenReportsPage() {
  const [report, setReport] = useState<ReportName>("gender-distribution");
  const query = useCitizenReportQuery(report);
  const rows = query.data ?? [];
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-bold">Citizen Reports</h1><p className="text-muted-foreground">Population statistics, gender, age, household, registration trends, and suspended citizens.</p></div><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div>
      <Card><CardHeader><CardTitle>Report Type</CardTitle></CardHeader><CardContent><Select value={report} onValueChange={(value) => setReport(value as ReportName)}><SelectTrigger className="max-w-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gender-distribution">Gender Distribution</SelectItem><SelectItem value="age-distribution">Age Distribution</SelectItem><SelectItem value="households">Household Report</SelectItem><SelectItem value="registration-trends">Registration Trends</SelectItem><SelectItem value="suspended">Suspended Citizens</SelectItem></SelectContent></Select></CardContent></Card>
      <Card><CardHeader><CardTitle>Results</CardTitle></CardHeader><CardContent>{query.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading report...</div> : <Table><TableHeader><TableRow>{columns.map((column) => <TableHead key={column}>{column.replaceAll("_", " ")}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-muted-foreground">No report data.</TableCell></TableRow> : rows.map((row: any, index: number) => <TableRow key={index}>{columns.map((column) => <TableCell key={column}>{String(row[column] ?? "—")}</TableCell>)}</TableRow>)}</TableBody></Table>}</CardContent></Card>
    </div>
  );
}
