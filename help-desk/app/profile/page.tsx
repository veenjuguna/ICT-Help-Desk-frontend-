import { User, Pencil } from "lucide-react";
import ProfileInput from "@/components/profile-input";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Profile Settings</h1>

        <p className="text-gray-500 mt-1">
          Manage your account information and security
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">
              Profile Information
            </h2>

            <button
              className="
                flex
                items-center
                gap-2
                border
                border-green-700
                text-green-700
                px-4
                py-2
                rounded-md
                hover:bg-green-50
                transition
              "
            >
              <Pencil size={18} />
              Edit
            </button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center my-8">
            <div
              className="
                w-24
                h-24
                rounded-full
                bg-green-100
                flex
                items-center
                justify-center
              "
            >
              <User size={42} className="text-green-700" />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-5">
            <ProfileInput label="Username" value="jkamau" />

            <ProfileInput label="Full Name" value="John Kamau" />

            <ProfileInput
              label="Email Address"
              value="john.kamau@treasury.go.ke"
              type="email"
            />

            <ProfileInput label="Phone Number" value="+254 700 123 456" />

            <ProfileInput label="Department" value="ICT Services" />
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-black mb-6">Security</h2>

          {/* Account Info */}
          <div className="space-y-5">
            <ProfileInput label="Username" value="jkamau" />

            <ProfileInput
              label="Email"
              value="john.kamau@treasury.go.ke"
              type="email"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Password Reset */}
          <div>
            <h3 className="text-xl font-bold text-black mb-6">
              Change Password
            </h3>

            <div className="space-y-5">
              <ProfileInput
                label="Current Password"
                placeholder="Enter current password"
                type="password"
              />

              <ProfileInput
                label="New Password"
                placeholder="Enter new password"
                type="password"
              />

              <ProfileInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                type="password"
              />
            </div>

            {/* Button */}
            <button
              className="
                w-full
                bg-green-700
                hover:bg-green-800
                text-white
                font-semibold
                py-3
                rounded-md
                mt-6
                transition
              "
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
