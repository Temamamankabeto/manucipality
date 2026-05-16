"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useCitizenReportQuery } from "@/hooks";

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1, 221 83% 53%))",
  },
  male: {
    label: "Male",
    color: "hsl(var(--chart-1, 221 83% 53%))",
  },
  female: {
    label: "Female",
    color: "hsl(var(--chart-2, 142 76% 36%))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-3, 38 92% 50%))",
  },
} satisfies ChartConfig;

const colors = [
  "hsl(var(--chart-1, 221 83% 53%))",
  "hsl(var(--chart-2, 142 76% 36%))",
  "hsl(var(--chart-3, 38 92% 50%))",
  "hsl(var(--chart-4, 0 84% 60%))",
  "hsl(var(--chart-5, 262 83% 58%))",
];

function toRows(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function genderRows(value: any) {
  return toRows(value).map((row, index) => ({
    name: String(row.gender ?? row.label ?? "Unknown"),
    total: Number(row.total ?? row.count ?? 0),
    fill: colors[index % colors.length],
  }));
}

function ageRows(value: any) {
  return toRows(value).map((row) => ({
    age: String(row.bucket ?? row.age_group ?? row.label ?? "Unknown"),
    total: Number(row.total ?? row.count ?? 0),
  }));
}

function trendRows(value: any) {
  return toRows(value).map((row) => ({
    date: String(row.date ?? row.month ?? row.label ?? "Unknown"),
    total: Number(row.total ?? row.count ?? 0),
  }));
}

export default function CitizenReportsPage() {
  const gender = useCitizenReportQuery("gender-distribution");
  const age = useCitizenReportQuery("age-distribution");
  const trends = useCitizenReportQuery("registration-trends");
  const households = useCitizenReportQuery("households");
  const suspended = useCitizenReportQuery("suspended");

  const genderData = genderRows(gender.data);
  const ageData = ageRows(age.data);
  const trendData = trendRows(trends.data);
  const householdData = toRows(households.data);
  const suspendedData = toRows(suspended.data);

  const totalRegistered =
    trendData.reduce((sum, item) => sum + item.total, 0) ||
    genderData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Citizen Reports</h1>
        <p className="text-muted-foreground">
          Population statistics, age distribution, household report,
          registration trends, and suspended citizens.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Registered Citizens" value={totalRegistered} />
        <MetricCard title="Households" value={householdData.length} />
        <MetricCard
          title="Suspended Citizens"
          value={suspendedData.length}
          danger
        />
        <MetricCard title="Report Categories" value={5} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>
              Citizen population grouped by gender.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gender.isLoading ? (
              <ChartSkeleton />
            ) : genderData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={genderData}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {genderData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Citizen count by age group.</CardDescription>
          </CardHeader>
          <CardContent>
            {age.isLoading ? (
              <ChartSkeleton />
            ) : ageData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart data={ageData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="age" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--chart-1, 221 83% 53%))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Citizen registrations over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.isLoading ? (
              <ChartSkeleton />
            ) : trendData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <LineChart data={trendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-1, 221 83% 53%))"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportTable
          title="Household Report"
          description="Recent household records and member counts."
          loading={households.isLoading}
          rows={householdData}
          columns={[
            { label: "Household", key: "household_number" },
            { label: "Status", key: "status", badge: true },
            { label: "Members", key: "members_count" },
            { label: "Zone", key: "zone" },
          ]}
          emptyText="No households found."
        />

        <ReportTable
          title="Suspended Citizens"
          description="Citizens currently suspended or restricted."
          loading={suspended.isLoading}
          rows={suspendedData}
          columns={[
            { label: "Name", key: "full_name" },
            { label: "Citizen ID", key: "citizen_uid" },
            { label: "Phone", key: "phone" },
            { label: "Zone", key: "zone" },
          ]}
          emptyText="No suspended citizens found."
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: number | string;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={danger ? "destructive" : "secondary"}>Live report</Badge>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[320px] w-full rounded-xl" />;
}

function EmptyChart() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      No report data found.
    </div>
  );
}

function ReportTable({
  title,
  description,
  rows,
  columns,
  loading,
  emptyText,
}: {
  title: string;
  description: string;
  rows: any[];
  columns: Array<{ label: string; key: string; badge?: boolean }>;
  loading?: boolean;
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-3 text-left font-semibold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t">
                    {columns.map((column) => {
                      const value = getValue(row, column.key);

                      return (
                        <td key={column.key} className="px-4 py-3">
                          {column.badge ? (
                            <Badge variant="secondary">{value || "—"}</Badge>
                          ) : (
                            value || "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getValue(row: any, key: string) {
  const value = row?.[key];

  if (typeof value === "object" && value !== null) {
    return value.name ?? value.full_name ?? JSON.stringify(value);
  }

  return value;
}