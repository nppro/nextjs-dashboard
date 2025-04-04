"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Extracting the data from FormData
  const rawFormData: Record<string, any> = Object.fromEntries(
    formData.entries()
  );

  const invoice = CreateInvoice.parse(rawFormData);
  const amountInCents = invoice.amount * 100;
  const date = new Date().toISOString().split("T")[0];
  console.log("Creating invoice:", invoice);

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${invoice.customerId}, ${amountInCents}, ${invoice.status}, ${date})
`;

  // Clear the cache for the invoices page
  // This is important because the page is statically generated
  revalidatePath("/dashboard/invoices");
  // Redirect the user to the invoices page
  redirect("/dashboard/invoices");
}

// Similarity to the createInvoce action, here you are:
// 1. Extracting the data from formData
// 2. Validating the types with Zod
// 3. Converting the amount to cents
// 4. Passing the variables to your SQL query
// 5. Calling revalidatePath to clear the client cache and make a new server request
// 6. Call redirect to redirect the user to the invoices page

export async function updateVoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse(
    Object.fromEntries(formData.entries())
  );

  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;

  // Clear the cache for the invoices page
  // This is important because the page is statically generated
  revalidatePath("/dashboard/invoices");
  // Redirect the user to the invoices page
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;

  // Clear the cache for the invoices page
  revalidatePath("/dashboard/invoices");
}
