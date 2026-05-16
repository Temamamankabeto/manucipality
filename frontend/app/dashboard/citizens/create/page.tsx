"use client";
import { useRouter } from "next/navigation";
import CitizenForm from "@/components/citizens/citizen-form";
import { useCreateCitizenMutation } from "@/hooks/citizen/use-citizens";
export default function CreateCitizenPage() { const router = useRouter(); const createCitizen = useCreateCitizenMutation((id) => router.replace(`/dashboard/citizens/${id ?? ""}`)); return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Register Citizen</h1><p className="text-muted-foreground">Create citizen draft from your assigned administrative location.</p></div><CitizenForm loading={createCitizen.isPending} submitLabel="Create draft" onSubmit={(payload) => createCitizen.mutate(payload)} /></div>; }
