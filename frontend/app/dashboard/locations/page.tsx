import { redirect } from "next/navigation";

export default function LocationsIndexPage() {
  redirect("/dashboard/locations/cities");
}
