"use client";

import { useParams } from "next/navigation";
import { CrudPage } from "@/components/Admin/CrudPage";
import { getResource } from "@/lib/admin/resources";

export default function ResourcePage() {
  const params = useParams<{ resource: string }>();
  const resource = getResource(params.resource);

  if (!resource) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unknown resource</h1>
        <p className="text-slate-500 mt-2">
          No admin resource found for &quot;{params.resource}&quot;.
        </p>
      </div>
    );
  }

  return <CrudPage resource={resource} />;
}
