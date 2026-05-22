export default function RequestPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Request Assistance</h1>

        <p className="text-gray-500 mt-1">Submit a new IT support ticket</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-5xl">
        <form className="space-y-6">
          {/* Grid Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>

              <input
                type="text"
                defaultValue="John Kamau"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>

              <input
                type="email"
                defaultValue="john.kamau@treasury.go.ke"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>

              <input
                type="text"
                defaultValue="+254 700 123 456"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>

              <input
                type="text"
                defaultValue="ICT Services"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
              />
            </div>

            {/* County */}
            <div className="space-y-2">
              <label className="text-sm font-medium">County *</label>

              <select
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  bg-white
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
                defaultValue=""
              >
                <option value="" disabled>
                  Select County
                </option>

                <option>Nairobi</option>
                <option>Mombasa</option>
                <option>Kisumu</option>
                <option>Nakuru</option>
                <option>Eldoret</option>
              </select>
            </div>

            {/* Office Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Office Number</label>

              <input
                type="text"
                placeholder="e.g Room 204, 3rd Floor"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-md
                  px-4
                  py-3
                  outline-none
                  focus:ring-2
                  focus:ring-amber-700
                "
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>

            <select
              className="
                w-full
                border
                border-gray-300
                rounded-md
                px-4
                py-3
                bg-white
                outline-none
                focus:ring-2
                focus:ring-amber-700
              "
              defaultValue=""
            >
              <option value="" disabled>
                Select Issue Category
              </option>

              <option>Hardware</option>
              <option>Software</option>
              <option>Network</option>
              <option>Access & Permissions</option>
              <option>Security Incident</option>
              <option>Other</option>
            </select>

            <p className="text-sm text-gray-500">
              Choose the category that best describes your issue
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description of Problem *
            </label>

            <textarea
              rows={6}
              placeholder="Please describe your issue in detail. Include any error messages, when the issue started, and steps to reproduce the problem..."
              className="
                w-full
                border
                border-gray-300
                rounded-md
                px-4
                py-3
                resize-none
                outline-none
                focus:ring-2
                focus:ring-amber-700
              "
            />

            <p className="text-sm text-gray-500">
              Minimum 5 characters required. Be as detailed as possible to help
              us resolve your issue quickly.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="
                border
                border-gray-300
                px-6
                py-3
                rounded-md
                hover:bg-gray-100
                transition
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                bg-amber-700
                hover:bg-amber-800
                text-white
                px-6
                py-3
                rounded-md
                transition
              "
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>

      {/* Category Guide */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-5xl">
        <h2 className="text-xl font-bold mb-6">Category Guide</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-amber-700">Hardware</h3>

              <p className="text-gray-600">
                Computer, printer, monitor, keyboard issues
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-amber-700">Network</h3>

              <p className="text-gray-600">
                Internet, WiFi, VPN connectivity problems
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-amber-700">
                Security Incident
              </h3>

              <p className="text-gray-600">
                Suspicious activity, malware, data breach
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-amber-700">Software</h3>

              <p className="text-gray-600">
                Application errors, installation requests
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-amber-700">
                Access & Permissions
              </h3>

              <p className="text-gray-600">
                File access, user account, login issues
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-amber-700">Other</h3>

              <p className="text-gray-600">
                Issues not covered by above categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
