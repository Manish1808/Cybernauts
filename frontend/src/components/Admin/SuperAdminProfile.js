import React, { useEffect, useState } from "react";
import pp from "../../assets/pp.jpg";
import "../styles/SuperAdminprofile.css";
import axios from "axios";

export default function SuperAdminProfile() {
  const [admins, setAdmins] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "", role: "" });

  const user = localStorage.getItem("user");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data.admins);
        setSuperAdmins(response.data.superadmins);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAdmins();
  }, []);

  const openPopup = (role) => {
    setNewUser({ name: "", email: "", password: "", phone: "", role: role.toLowerCase() });
    setShowPopup(true);
  };  

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log(newUser);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:3001/auth/signup", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      alert(response.data.message); // Show success message
  
      // Add the new user to the appropriate state array
      if (newUser.role === "admin") {
        setAdmins((prevAdmins) => [...prevAdmins, { name: newUser.name, phone: newUser.phone }]);
      } else if (newUser.role === "superadmin") {
        setSuperAdmins((prevSuperAdmins) => [...prevSuperAdmins, { name: newUser.name, phone: newUser.phone }]);
      }
  
      closePopup();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add user"); // Show error message
    }
  };
  

  return (
    <>
      <div className="SuperAdmin">
        <div className="SuperAdminContainer">
          <div className="SuperAdmin-Main">
            <div className="SuperAdminImg">
              <img src={pp} alt="Profile" />
            </div>
            <div className="SuperAdminDetails">
              <h1 className="item">{localStorage.getItem("name")}</h1>
              <h1 className="item">{localStorage.getItem("phone")}</h1>
              <h1 className="item">{localStorage.getItem("email")}</h1>
            </div>
          </div>
          <div className="SuperAdmin-Body">
            <div className="SuperAdminsManage">
              <div className="Addbut">
                <h1>SuperAdmins</h1>
                <button onClick={() => openPopup("SuperAdmin")}>Add-SuperAdmin+</button>
              </div>
              {superAdmins.map((superAdmin, index) => (
                <div className="ManageContainer" key={index}>
                  <div className="item">{superAdmin.name}</div>
                  <div className="item">{superAdmin.phone}</div>
                  <div className="butons">
                    <button className="icon-button">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="icon-button delete">
                      <i className="fa-solid fa-trash" style={{ color: "#ff5447" }}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="AdminsManage">
              <div className="Addbut">
                <h1>Admins</h1>
                <button onClick={() => openPopup("Admin")}>Add-Admin+</button>
              </div>
              {admins.map((admin, index) => (
                <div className="ManageContainer" key={index}>
                  <div className="item">{admin.name}</div>
                  <div className="item">{admin.phone}</div>
                  <div className="butons">
                    <button className="icon-button">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="icon-button delete">
                      <i className="fa-solid fa-trash" style={{ color: "#ff5447" }}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Add {newUser.role}</h2>
            <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleChange} />
            <input type="text" name="phone" placeholder="Phone" value={newUser.phone} onChange={handleChange} />
            <input type="text" name="role" value={newUser.role} disabled />
            <button onClick={handleSubmit}>Add</button>
            <button onClick={closePopup}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
