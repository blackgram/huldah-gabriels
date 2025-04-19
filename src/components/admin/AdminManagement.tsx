/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential,
} from "firebase/auth";
import { useAuth } from "../../Hooks/useAuth";
import { ScaleLoader } from "react-spinners";

interface AdminData {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  permissions: string[];
  createdAt?: Date;
}

interface NewAdminData {
  email: string;
  name: string;
  role: "admin" | "superadmin";
  permissions: string[];
}

interface MessageState {
  type: "success" | "error" | "";
  text: string;
}

const AdminManagement: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newAdminData, setNewAdminData] = useState<NewAdminData>({
    email: "",
    name: "",
    role: "admin", // Default role
    permissions: [],
  });
  const [formError, setFormError] = useState<string>("");
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Fetch all admins from Firestore
  const fetchAdmins = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const adminsCollection = collection(db, "admins");
      const snapshot = await getDocs(adminsCollection);

      const adminsList: AdminData[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          email: doc.data().email || "",
          name: doc.data().name || "",
          role: doc.data().role || "admin",
          permissions: doc.data().permissions || [],
          createdAt: doc.data().createdAt,
        })
      );

      setAdmins(adminsList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setMessage({ type: "error", text: "Failed to load admin accounts" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setNewAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permission: string): void => {
    setNewAdminData((prev) => {
      const currentPermissions = [...prev.permissions];

      if (currentPermissions.includes(permission)) {
        return {
          ...prev,
          permissions: currentPermissions.filter((p) => p !== permission),
        };
      } else {
        return {
          ...prev,
          permissions: [...currentPermissions, permission],
        };
      }
    });
  };

  const createAdmin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError("");

    if (!newAdminData.email || !newAdminData.name) {
      setFormError("Email and name are required");
      return;
    }

    setIsAdding(true);

    try {
      // First check if user exists in Auth (by checking if email is in use)
      let uid;

      try {
        // Try to create user in Firebase Auth
        const userCredential: UserCredential =
          await createUserWithEmailAndPassword(
            auth,
            newAdminData.email,
            // Generate a random temporary password
            Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8)
          );
        uid = userCredential.user.uid;

        // Send password reset email if successful
        await sendPasswordResetEmail(auth, newAdminData.email);
      } catch (authError: any) {
        // If user already exists, check if they're already in admin collection
        if (authError.code === "auth/email-already-in-use") {
            setFormError("This email already exists. Please contact application manager!.");
            setIsAdding(false);
            return;
            
          } else {
          throw authError;
        }
      }

      // Store admin data in Firestore
      await setDoc(doc(db, "admins", uid), {
        email: newAdminData.email,
        name: newAdminData.name,
        role: newAdminData.role,
        permissions: newAdminData.permissions,
        createdAt: new Date(),
      });

      setMessage({
        type: "success",
        text: `Admin account created for ${newAdminData.email}. A password reset email has been sent.`,
      });

      // Reset form
      setNewAdminData({
        email: "",
        name: "",
        role: "admin",
        permissions: [],
      });

      setIsAdding(false);
      fetchAdmins(); // Refresh the list
    } catch (error: any) {
      console.error("Error creating admin:", error);
      setFormError(error.message || "Failed to create admin account");
      setIsAdding(false);
    }
  };

  const removeAdmin = async (
    adminId: string,
    adminEmail: string
  ): Promise<void> => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${adminEmail} as an admin?`
      )
    ) {
      return;
    }

    try {
      // Remove from Firestore only - we don't delete the Auth account
      await deleteDoc(doc(db, "admins", adminId));
      setMessage({
        type: "success",
        text: `Admin ${adminEmail} has been removed`,
      });
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error("Error removing admin:", error);
      setMessage({ type: "error", text: "Failed to remove admin" });
    }
  };

  // If not a superadmin, show access denied
  if (!isSuperAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-10 text-center">
          <div className="text-red-500">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You don't have permission to manage admin accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow lg:max-w-[90%] xl:max-w-[100%]">
      <h2 className="text-xl font-semibold mb-4">Admin Management</h2>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
          <button
            className="ml-2 font-bold"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            ×
          </button>
        </div>
      )}

      {/* Admin Creation Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Add New Admin</h3>

        <form onSubmit={createAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={newAdminData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={newAdminData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                placeholder="Admin Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={newAdminData.role}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["manage_waitlist", "manage_products", "manage_orders"].map(
                (permission) => (
                  <div key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      id={permission}
                      checked={newAdminData.permissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      className="mr-2"
                    />
                    <label htmlFor={permission} className="text-sm">
                      {permission
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={isAdding}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:bg-gray-400"
          >
            {isAdding ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Current Admins</h3>
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            disabled={isLoading}
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <ScaleLoader color="#946A2E" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No admins found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Permissions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          admin.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions?.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {permission.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => removeAdmin(admin.id, admin.email)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
