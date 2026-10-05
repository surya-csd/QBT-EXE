import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Percent,
  Building2,
  Users,
  Save,
} from "lucide-react";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("company");

  // IDs from master API
  const [companyId, setCompanyId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [gstId, setGstId] = useState(null);

  // GST
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");
  const [igst, setIgst] = useState("");

  // Company
  const [company, setCompany] = useState({
    name: "",
    address: "",
    email: "",
    mobile: "",
    vendorNo: "",
    gstNo: "",
    state: "",
    pincode: "",
  });

  // Customer
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    email: "",
    mobile: "",
    gstNo: "",
    state: "",
    pincode: "",
    through: "",
  });

  // Edit states
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isEditingGST, setIsEditingGST] = useState(false);

  // Saving states
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [isSavingGST, setIsSavingGST] = useState(false);

  const [message, setMessage] = useState("");

  // ============================================================
  // GET ALL MASTER DATA
  // ============================================================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get(
          "/master"
        );

        const result = response.data;

        if (!result.success || !Array.isArray(result.data)) {
          setMessage("Failed to load settings.");
          return;
        }

        const masterData = result.data;

        // ======================================================
        // COMPANY
        // ======================================================

        const companyData = masterData.find(
          (item) => item.type === "company"
        );

        if (companyData) {
          setCompanyId(companyData.id);

          setCompany({
            name: companyData.name || "",
            address: companyData.address || "",
            email: companyData.email || "",
            mobile: companyData.mobile || "",
            vendorNo: companyData.vendorNo || "",
            gstNo: companyData.gstNo || "",
            state: companyData.state || "",
            pincode: companyData.pincode || "",
          });
        }

        // ======================================================
        // CUSTOMER
        // ======================================================

        const customerData = masterData.find(
          (item) => item.type === "customer"
        );

        if (customerData) {
          setCustomerId(customerData.id);

          setCustomer({
            name: customerData.name || "",
            address: customerData.address || "",
            email: customerData.email || "",
            mobile: customerData.mobile || "",
            gstNo: customerData.gstNo || "",
            state: customerData.state || "",
            pincode: customerData.pincode || "",
            through: customerData.through || "",
          });
        }

        // ======================================================
        // GST
        // ======================================================

        const gstData = masterData.find(
          (item) => item.type === "gst"
        );

        if (gstData) {
          setGstId(gstData.id);

          setCgst(
            gstData.cgstRate !== null && gstData.cgstRate !== undefined
              ? String(gstData.cgstRate)
              : ""
          );

          setSgst(
            gstData.sgstRate !== null && gstData.sgstRate !== undefined
              ? String(gstData.sgstRate)
              : ""
          );

          setIgst(
            gstData.igstRate !== null && gstData.igstRate !== undefined
              ? String(gstData.igstRate)
              : ""
          );
        }
      } catch (error) {
        console.error("Failed to load master settings:", error);
        setMessage("Failed to load settings.");
      }
    };

    loadSettings();
  }, []);

  // ============================================================
  // GST VALUE CONTROLS
  // ============================================================

  const increaseValue = (value, setter) => {
    const current = Number(value) || 0;
    setter((current + 0.01).toFixed(2));
  };

  const decreaseValue = (value, setter) => {
    const current = Number(value) || 0;

    if (current > 0) {
      setter(
        Math.max(0, current - 0.01).toFixed(2)
      );
    }
  };

  // ============================================================
  // COMPANY CHANGE
  // ============================================================

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;

    setCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // CUSTOMER CHANGE
  // ============================================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // UPDATE COMPANY
  // ============================================================

  const handleSaveCompany = async () => {
    if (!companyId) {
      setMessage("Company ID not found.");
      return;
    }

    const startTime = Date.now();

    try {
      setIsSavingCompany(true);
      setMessage("");

      const response = await api.put(
        `/master/${companyId}`,
        {
          type: "company",
          name: company.name,
          address: company.address,
          email: company.email,
          mobile: company.mobile,
          vendorNo: company.vendorNo,
          gstNo: company.gstNo,
          state: company.state,
          pincode: company.pincode,
        }
      );

      const result = response.data;

      if (result.success) {
        setMessage("Company details updated successfully.");
        setIsEditingCompany(false);
      } else {
        setMessage("Failed to update company details.");
      }
    } catch (error) {
      console.error("Failed to update company:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update company details."
      );
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(700 - elapsedTime, 0);

      setTimeout(() => {
        setIsSavingCompany(false);
      }, remainingTime);
    }
  };

  // ============================================================
  // UPDATE CUSTOMER
  // ============================================================

  const handleSaveCustomer = async () => {
    if (!customerId) {
      setMessage("Customer ID not found.");
      return;
    }

    const startTime = Date.now();

    try {
      setIsSavingCustomer(true);
      setMessage("");

      const response = await api.put(
        `/master/${customerId}`,
        {
          type: "customer",
          name: customer.name,
          address: customer.address,
          email: customer.email,
          mobile: customer.mobile,
          gstNo: customer.gstNo,
          state: customer.state,
          pincode: customer.pincode,
          through: customer.through,
        }
      );

      const result = response.data;

      if (result.success) {
        setMessage("Customer details updated successfully.");
        setIsEditingCustomer(false);
      } else {
        setMessage("Failed to update customer details.");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update customer details."
      );
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(700 - elapsedTime, 0);

      setTimeout(() => {
        setIsSavingCustomer(false);
      }, remainingTime);
    }
  };

  // ============================================================
  // UPDATE GST
  // ============================================================

  const handleSaveGST = async () => {
    if (!gstId) {
      setMessage("GST ID not found.");
      return;
    }

    try {
      setIsSavingGST(true);
      setMessage("");

      const response = await api.put(
        `/master/${gstId}`,
        {
          type: "gst",
          cgstRate: Number(cgst),
          sgstRate: Number(sgst),
          igstRate: Number(igst),
        }
      );

      const result = response.data;

      if (result.success) {
        setMessage("GST settings updated successfully.");
        setIsEditingGST(false);
      } else {
        setMessage("Failed to update GST settings.");
      }
    } catch (error) {
      console.error("Failed to update GST:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to update GST settings."
      );
    } finally {
      setIsSavingGST(false);
    }
  };

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  const handleCancelCompany = () => {
    setIsEditingCompany(false);
    setMessage("");
  };

  const handleCancelCustomer = () => {
    setIsEditingCustomer(false);
    setMessage("");
  };

  const handleCancelGST = () => {
    setIsEditingGST(false);
    setMessage("");
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="settings-page">

      <p className="settings-description">
        Manage your contractor office settings
      </p>

      {/* SETTINGS TABS */}
      <div className="settings-tabs">

        {/* COMPANY */}
        <button
          type="button"
          className={`settings-tab ${
            activeTab === "company" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("company");
            setMessage("");
          }}
        >
          <span className="settings-tab-icon">
            <Building2 size={19} />
          </span>

          <span>Company</span>
        </button>

        {/* CUSTOMER */}
        <button
          type="button"
          className={`settings-tab ${
            activeTab === "customer" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("customer");
            setMessage("");
          }}
        >
          <span className="settings-tab-icon">
            <Users size={19} />
          </span>

          <span>Customer</span>
        </button>

        {/* GST */}
        <button
          type="button"
          className={`settings-tab ${
            activeTab === "gst" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("gst");
            setMessage("");
          }}
        >
          <span className="settings-tab-icon">
            <Percent size={19} />
          </span>

          <span>GST</span>
        </button>
      </div>

      {/* ======================================================
          GST
      ====================================================== */}

      {activeTab === "gst" && (
        <div className="settings-card  gst-card">

          <h2>GST Settings</h2>

          <img
            src={`${import.meta.env.BASE_URL}images/Settings-image.png`}
            alt="Settings"
            className="settings-image"
          />

          {/* CGST */}
          <div className="settings-field">
            <label>CGST Rate (%)</label>

            <div className="number-input-wrapper">

              <input
                type="number"
                value={cgst}
                onChange={(e) => setCgst(e.target.value)}
                min="0"
                step="0.01"
                readOnly={!isEditingGST}
              />

              <div className="custom-arrows">

                <button
                  type="button"
                  className="arrow-up"
                  onClick={() =>
                    isEditingGST &&
                    increaseValue(cgst, setCgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▲
                </button>

                <button
                  type="button"
                  className="arrow-down"
                  onClick={() =>
                    isEditingGST &&
                    decreaseValue(cgst, setCgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▼
                </button>

              </div>
            </div>
          </div>

          {/* SGST */}
          <div className="settings-field">
            <label>SGST Rate (%)</label>

            <div className="number-input-wrapper">

              <input
                type="number"
                value={sgst}
                onChange={(e) => setSgst(e.target.value)}
                min="0"
                step="0.01"
                readOnly={!isEditingGST}
              />

              <div className="custom-arrows">

                <button
                  type="button"
                  className="arrow-up"
                  onClick={() =>
                    isEditingGST &&
                    increaseValue(sgst, setSgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▲
                </button>

                <button
                  type="button"
                  className="arrow-down"
                  onClick={() =>
                    isEditingGST &&
                    decreaseValue(sgst, setSgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▼
                </button>

              </div>
            </div>
          </div>

          {/* IGST */}
          <div className="settings-field">
            <label>IGST Rate (%)</label>

            <div className="number-input-wrapper">

              <input
                type="number"
                value={igst}
                onChange={(e) => setIgst(e.target.value)}
                min="0"
                step="0.01"
                readOnly={!isEditingGST}
              />

              <div className="custom-arrows">

                <button
                  type="button"
                  className="arrow-up"
                  onClick={() =>
                    isEditingGST &&
                    increaseValue(igst, setIgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▲
                </button>

                <button
                  type="button"
                  className="arrow-down"
                  onClick={() =>
                    isEditingGST &&
                    decreaseValue(igst, setIgst)
                  }
                  disabled={!isEditingGST}
                >
                  ▼
                </button>

              </div>
            </div>
          </div>

          {/* GST BUTTONS */}
          <div className="settings-action-buttons">
            {!isEditingGST ? (
              <button
                type="button"
                className="settings-save"
                onClick={() => {
                  setIsEditingGST(true);
                  setMessage("");
                }}
              >
                <Save size={15} />
                Edit GST Settings
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="settings-save"
                  onClick={handleSaveGST}
                  disabled={isSavingGST}
                >
                  {isSavingGST ? (
                    <>
                      <span className="button-loader"></span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Update GST Settings
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="settings-save cancel-button"
                  onClick={handleCancelGST}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {message && (
            <p className="settings-message">
              {message}
            </p>
          )}

        </div>
      )}

      {/* ======================================================
          COMPANY
      ====================================================== */}

      {activeTab === "company" && (
        <div className="settings-card details-card">

          <div className="details-heading">

            <div className="details-icon company-icon">
              <Building2 size={22} />
            </div>

            <div>
              <h2>Company Details</h2>
              <p>Enter your company information</p>
            </div>

          </div>

          <div className="details-grid">

            {/* Name */}
            <div className="details-field">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={company.name}
                onChange={handleCompanyChange}
                placeholder="Enter company name"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* Mobile */}
            <div className="details-field">
              <label>Mobile</label>

              <input
                type="text"
                name="mobile"
                value={company.mobile}
                onChange={handleCompanyChange}
                placeholder="Enter mobile number"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* Address */}
            <div className="details-field full-width">
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={company.address}
                onChange={handleCompanyChange}
                placeholder="Enter company address"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* Email */}
            <div className="details-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={company.email}
                onChange={handleCompanyChange}
                placeholder="Enter company email"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* Vendor No */}
            <div className="details-field">
              <label>Vendor No</label>

              <input
                type="text"
                name="vendorNo"
                value={company.vendorNo}
                onChange={handleCompanyChange}
                placeholder="Enter vendor number"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* GST No */}
            <div className="details-field">
              <label>GST No</label>

              <input
                type="text"
                name="gstNo"
                value={company.gstNo}
                onChange={handleCompanyChange}
                placeholder="Enter GST number"
                readOnly={!isEditingCompany}
              />
            </div>

            {/* State */}
            <div className="details-field">
              <label>State</label>

              <select
                name="state"
                value={company.state}
                onChange={handleCompanyChange}
                disabled={!isEditingCompany}
              >
                <option value="">Select state</option>

                <option value="Tamil Nadu">
                  Tamil Nadu
                </option>

                <option value="Kerala">
                  Kerala
                </option>

                <option value="Karnataka">
                  Karnataka
                </option>

                <option value="Andhra Pradesh">
                  Andhra Pradesh
                </option>

                <option value="Telangana">
                  Telangana
                </option>
              </select>
            </div>

            {/* Pincode */}
            <div className="details-field">
              <label>Pincode</label>

              <input
                type="text"
                name="pincode"
                value={company.pincode}
                onChange={handleCompanyChange}
                placeholder="Enter pincode"
                readOnly={!isEditingCompany}
              />
            </div>

          </div>

          {/* COMPANY BUTTONS */}
          <div className="settings-action-buttons">
            {!isEditingCompany ? (
              <button
                type="button"
                className="details-save"
                onClick={() => {
                  setIsEditingCompany(true);
                  setMessage("");
                }}
              >
                <Save size={15} />
                <span>Edit Company Details</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="details-save"
                  onClick={handleSaveCompany}
                  disabled={isSavingCompany}
                >
                  {isSavingCompany ? (
                    <>
                      <span className="button-loader"></span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Update Company Details</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="details-save cancel-button"
                  onClick={handleCancelCompany}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {message && (
            <p className="settings-message">
              {message}
            </p>
          )}

        </div>
      )}

      {/* ======================================================
          CUSTOMER
      ====================================================== */}

      {activeTab === "customer" && (
        <div className="settings-card details-card">

          <div className="details-heading">

            <div className="details-icon customer-icon">
              <Users size={22} />
            </div>

            <div>
              <h2>Customer Details</h2>
              <p>Enter your customer information</p>
            </div>

          </div>

          <div className="details-grid">

            {/* Name */}
            <div className="details-field">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                placeholder="Enter customer name"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* Mobile */}
            <div className="details-field">
              <label>Mobile</label>

              <input
                type="text"
                name="mobile"
                value={customer.mobile}
                onChange={handleCustomerChange}
                placeholder="Enter mobile number"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* Address */}
            <div className="details-field full-width">
              <label>Address</label>

              <input
                type="text"
                name="address"
                value={customer.address}
                onChange={handleCustomerChange}
                placeholder="Enter customer address"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* Email */}
            <div className="details-field">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                placeholder="Enter email address"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* GST No */}
            <div className="details-field">
              <label>GST No</label>

              <input
                type="text"
                name="gstNo"
                value={customer.gstNo}
                onChange={handleCustomerChange}
                placeholder="Enter GST number"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* State */}
            <div className="details-field">
              <label>State</label>

              <select
                name="state"
                value={customer.state}
                onChange={handleCustomerChange}
                disabled={!isEditingCustomer}
              >
                <option value="">Select state</option>

                <option value="Tamil Nadu">
                  Tamil Nadu
                </option>

                <option value="Kerala">
                  Kerala
                </option>

                <option value="Karnataka">
                  Karnataka
                </option>

                <option value="Andhra Pradesh">
                  Andhra Pradesh
                </option>

                <option value="Telangana">
                  Telangana
                </option>
              </select>
            </div>

            {/* Pincode */}
            <div className="details-field">
              <label>Pincode</label>

              <input
                type="text"
                name="pincode"
                value={customer.pincode}
                onChange={handleCustomerChange}
                placeholder="Enter pincode"
                readOnly={!isEditingCustomer}
              />
            </div>

            {/* Through */}
            <div className="details-field">
              <label>Through</label>

              <input
  type="text"
  name="through"
  value={customer.through}
  onChange={handleCustomerChange}
  placeholder="Enter through"
  readOnly={!isEditingCustomer}
/>
            </div>

          </div>

          {/* CUSTOMER BUTTONS */}
          <div className="settings-action-buttons">
            {!isEditingCustomer ? (
              <button
                type="button"
                className="details-save customer-save"
                onClick={() => {
                  setIsEditingCustomer(true);
                  setMessage("");
                }}
              >
                <Save size={15} />
                <span>Edit Customer Details</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="details-save customer-save"
                  onClick={handleSaveCustomer}
                  disabled={isSavingCustomer}
                >
                  {isSavingCustomer ? (
                    <>
                      <span className="button-loader"></span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Update Customer Details</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="details-save customer-save cancel-button"
                  onClick={handleCancelCustomer}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {message && (
            <p className="settings-message">
              {message}
            </p>
          )}

        </div>
      )}

    </div>
  );
}

export default Settings;