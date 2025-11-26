import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  const goBack = () => navigate(-1)

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white dark:bg-gray-900 p-10 text-center shadow-2xl max-w-lg w-full"
      >
        {/* 🎨 Ilustrasi */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="h-40 w-40 text-blue-500"
          >
            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
            <path
              d="M70 120h60M85 140h30"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="75" cy="85" r="8" fill="currentColor" />
            <circle cx="125" cy="85" r="8" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Judul */}
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
          404
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Tombol Back */}
        <button
          onClick={goBack}
          className="rounded-lg bg-sidebar-foreground px-6 py-3 font-medium text-white shadow-lg hover:bg-primary transition-colors"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  )
}

export default NotFound
