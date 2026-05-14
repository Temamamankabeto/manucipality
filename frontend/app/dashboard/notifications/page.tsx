"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteNotificationMutation, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotificationsQuery } from "@/hooks";

export default function NotificationsPage() {
  const [status, setStatus] = useState<"all" | "read" | "unread">("all");
  const query = useNotificationsQuery({ status, per_page: 25 });
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const remove = useDeleteNotificationMutation();
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">In-app notifications for registration, approval, rejection, and profile updates.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button><Button onClick={() => markAll.mutate()}>Mark all read</Button></div></div>
      <Card><CardHeader><CardTitle>Filter</CardTitle></CardHeader><CardContent><Select value={status} onValueChange={(value) => setStatus(value as any)}><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="unread">Unread</SelectItem><SelectItem value="read">Read</SelectItem></SelectContent></Select></CardContent></Card>
      <div className="space-y-3">{query.isLoading ? <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading notifications...</div> : rows.length === 0 ? <Card><CardContent className="py-10 text-center text-muted-foreground">No notifications.</CardContent></Card> : rows.map((notification) => <Card key={notification.id}><CardContent className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{notification.title}</h3><Badge variant={notification.read_at ? "outline" : "default"}>{notification.read_at ? "read" : "unread"}</Badge></div><p className="text-sm text-muted-foreground">{notification.message}</p></div><div className="flex gap-2">{!notification.read_at && <Button size="sm" variant="outline" onClick={() => markRead.mutate(notification.id)}>Mark read</Button>}<Button size="sm" variant="destructive" onClick={() => remove.mutate(notification.id)}>Delete</Button></div></CardContent></Card>)}</div>
    </div>
  );
}
