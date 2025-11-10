import Link from 'next/link'

export default function Custom410() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-900">410</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Gone</h2>
          <p className="mt-4 text-lg text-gray-600">
            This page has been permanently removed.
          </p>
        </div>
        <div className="mt-8">
          <Link 
  href="/"
  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
>
  Return to Homepage
</Link>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ res }) {
  res.statusCode = 410
  return {
    props: {}
  }
}