import { redirect } from 'next/navigation'

// A raiz apenas encaminha — o middleware cuida de login/dashboard.
export default function Home() {
  redirect('/dashboard')
}