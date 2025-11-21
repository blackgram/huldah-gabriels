/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "../../Hooks/useAuth";
import { ScaleLoader } from "react-spinners";
import toast from "react-hot-toast";
import {
  getAllDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeActive,
  getDiscountCodeUsage,
  DiscountCode,
  DiscountCodeInput,
  DiscountCodeUsage,
} from "../../services/discountCodeService";

interface DiscountCodeFormData {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usageLimit: number;
  minPurchaseAmount: number;
  description: string;
}

const AdminDiscountCodes: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState<DiscountCodeFormData>({
    code: "",
    type: "percentage",
    value: 0,
    isActive: true,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    minPurchaseAmount: 0,
    description: "",
  });
  const [formError, setFormError] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [usageHistory, setUsageHistory] = useState<DiscountCodeUsage[]>([]);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    if (isAdmin) {
      fetchCodes();
    }
  }, [isAdmin]);

  const fetchCodes = async () => {
    try {
      setIsLoading(true);
      const allCodes = await getAllDiscountCodes();
      setCodes(allCodes);
    } catch (error: any) {
      console.error("Error fetching discount codes:", error);
      toast.error("Failed to load discount codes");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageHistory = async (code: DiscountCode) => {
    try {
      const usage = await getDiscountCodeUsage(code.id);
      setSelectedCode(code);
      setUsageHistory(usage);
      setShowUsageModal(true);
    } catch (error: any) {
      console.error("Error fetching usage history:", error);
      toast.error("Failed to load usage history");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "value" || name === "usageLimit" || name === "minPurchaseAmount"
          ? parseFloat(value) || 0
          : name === "isActive"
          ? type === "checkbox"
            ? checked
            : value === "true"
          : value,
    }));
  };

  const resetForm = (): void => {
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      isActive: true,
      startDate: "",
      endDate: "",
      usageLimit: 0,
      minPurchaseAmount: 0,
      description: "",
    });
    setEditingCode(null);
    setFormError("");
    setIsFormOpen(false);
  };

  const handleEdit = (code: DiscountCode): void => {
    setEditingCode(code);
    const formatDateForInput = (date?: Date | string): string => {
      if (!date) return "";
      const d = date instanceof Date ? date : new Date(date);
      return d.toISOString().split("T")[0];
    };

    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      isActive: code.isActive !== false,
      startDate: formatDateForInput(code.startDate),
      endDate: formatDateForInput(code.endDate),
      usageLimit: code.usageLimit || 0,
      minPurchaseAmount: code.minPurchaseAmount || 0,
      description: code.description || "",
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.code.trim()) {
      setFormError("Discount code is required");
      return;
    }

    if (formData.value <= 0) {
      setFormError("Discount value must be greater than 0");
      return;
    }

    if (formData.type === "percentage" && formData.value > 100) {
      setFormError("Percentage discount cannot exceed 100%");
      return;
    }

    if (formData.usageLimit < 0) {
      setFormError("Usage limit cannot be negative");
      return;
    }

    if (formData.minPurchaseAmount < 0) {
      setFormError("Minimum purchase amount cannot be negative");
      return;
    }

    setIsAdding(true);

    try {
      const codeInput: DiscountCodeInput = {
        code: formData.code.trim(),
        type: formData.type,
        value: formData.value,
        isActive: formData.isActive,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined,
        minPurchaseAmount: formData.minPurchaseAmount > 0 ? formData.minPurchaseAmount : undefined,
        description: formData.description.trim() || undefined,
      };

      if (editingCode) {
        await updateDiscountCode(editingCode.id, codeInput);
        toast.success("Discount code updated successfully!");
      } else {
        await createDiscountCode(codeInput, user?.uid);
        toast.success("Discount code created successfully!");
      }

      resetForm();
      fetchCodes();
    } catch (error: any) {
      console.error("Error saving discount code:", error);
      setFormError(error.message || "Failed to save discount code");
      toast.error(error.message || "Failed to save discount code");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (codeId: string): Promise<void> => {
    if (
      !window.confirm(
        "Are you sure you want to delete this discount code? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDiscountCode(codeId);
      toast.success("Discount code deleted successfully!");
      fetchCodes();
    } catch (error: any) {
      console.error("Error deleting discount code:", error);
      toast.error("Failed to delete discount code");
    }
  };

  const handleToggleActive = async (code: DiscountCode, isActive: boolean): Promise<void> => {
    try {
      await toggleDiscountCodeActive(code.id, isActive);
      toast.success(`Discount code ${isActive ? "activated" : "deactivated"} successfully!`);
      fetchCodes();
    } catch (error: any) {
      console.error("Error toggling discount code status:", error);
      toast.error("Failed to update discount code status");
    }
  };

  // Filter codes
  const filteredCodes = React.useMemo(() => {
    let filtered = [...codes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(query) ||
          (code.description && code.description.toLowerCase().includes(query))
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((code) => code.isActive !== false);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((code) => code.isActive === false);
    }

    return filtered;
  }, [codes, searchQuery, statusFilter]);

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-10 text-center">
          <div className="text-red-500">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You don't have permission to manage discount codes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow lg:max-w-[90%] xl:max-w-[100%]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Discount Code Management</h2>
        {!isFormOpen && !editingCode && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add New Code
          </button>
        )}
      </div>

      {/* Discount Code Form */}
      {(isFormOpen || editingCode) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">
              {editingCode ? "Edit Discount Code" : "Add New Discount Code"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close form"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="e.g., SAVE20"
                  required
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                >
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed">Fixed Amount Off</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                  {formData.type === "percentage" ? " (%)" : " ($)"}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder={formData.type === "percentage" ? "0-100" : "0.00"}
                  step={formData.type === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Purchase Amount ($)
                </label>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave 0 for no minimum</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="0 for unlimited"
                  step="1"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Leave 0 for unlimited uses</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded p-2"
                rows={3}
                placeholder="Internal description or notes..."
              />
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isAdding}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:bg-gray-400"
              >
                {isAdding
                  ? "Saving..."
                  : editingCode
                  ? "Update Code"
                  : "Create Code"}
              </button>
              {editingCode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">
            Discount Codes ({filteredCodes.length} of {codes.length})
          </h3>
          <button
            onClick={fetchCodes}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm"
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

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Discount Codes List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <ScaleLoader color="#946A2E" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <p className="text-gray-500 py-4 text-center">
          {codes.length === 0
            ? "No discount codes found. Create your first code above!"
            : "No codes match your search criteria."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCodes.map((code) => {
                const formatDate = (date?: Date | string): string => {
                  if (!date) return "N/A";
                  const d = date instanceof Date ? date : new Date(date);
                  return d.toLocaleDateString();
                };

                const isExpired =
                  code.endDate &&
                  new Date(code.endDate instanceof Date ? code.endDate : new Date(code.endDate)) <
                    new Date();

                return (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{code.code}</div>
                      {code.description && (
                        <div className="text-xs text-gray-500">{code.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {code.type === "percentage" ? "Percentage" : "Fixed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.type === "percentage" ? `${code.value}%` : `$${code.value.toFixed(2)}`}
                      {code.minPurchaseAmount && code.minPurchaseAmount > 0 && (
                        <div className="text-xs text-gray-400">
                          Min: ${code.minPurchaseAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {code.usageCount} / {code.usageLimit || "∞"}
                      </div>
                      <button
                        onClick={() => fetchUsageHistory(code)}
                        className="text-xs text-primary hover:underline"
                      >
                        View History
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          code.isActive !== false && !isExpired
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {code.isActive !== false && !isExpired ? "Active" : "Inactive"}
                        {isExpired && " (Expired)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        <div>Start: {formatDate(code.startDate)}</div>
                        <div>End: {formatDate(code.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(code)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(code, code.isActive === false)
                          }
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          {code.isActive !== false ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Usage History Modal */}
      {showUsageModal && selectedCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Usage History: {selectedCode.code}
                </h3>
                <button
                  onClick={() => {
                    setShowUsageModal(false);
                    setSelectedCode(null);
                    setUsageHistory([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              {usageHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No usage history found for this code.
                </p>
              ) : (
                <div className="space-y-2">
                  {usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className="border border-gray-200 rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{usage.email}</div>
                        <div className="text-sm text-gray-500">
                          Order: {usage.orderId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {usage.timestamp?.toDate
                            ? usage.timestamp.toDate().toLocaleString()
                            : new Date(usage.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          -${usage.discountAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: ${usage.orderTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscountCodes;

