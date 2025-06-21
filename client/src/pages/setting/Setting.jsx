import { useState } from "react";
import Layout from "../../components/layout/Layout";
import "./setting.scss";

const Setting = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [formData, setFormData] = useState({
    username: "johndoe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    firstName: "John",
    lastName: "Doe",
    bio: "Software Developer | Coffee Lover | Travel Enthusiast",
    location: "New York, USA",
    work: "Senior Developer at Tech Corp",
    education: "Computer Science at University of Technology",
    website: "https://johndoe.dev",
    dateOfBirth: "1990-05-15",
    gender: "Male",
    notifications: {
      email: true,
      push: true,
      sms: false,
      friendRequests: true,
      messages: true,
      likes: true,
      comments: true,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
      showBirthday: true,
      allowFriendRequests: true,
      allowMessages: true,
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const handlePrivacyChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value,
      },
    }));
  };

  const handleSave = () => {
    console.log("Saving settings:", formData);
    alert("Settings saved successfully!");
  };

  return (
    <Layout>
      <div className='setting'>
        <div className='setting-content'>
          <div className='setting-header'>
            <h1>Settings</h1>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className='setting-nav'>
            <button
              className={`nav-item ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              Account
            </button>
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`nav-item ${activeTab === "privacy" ? "active" : ""}`}
              onClick={() => setActiveTab("privacy")}
            >
              Privacy
            </button>
            <button
              className={`nav-item ${
                activeTab === "notifications" ? "active" : ""
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifications
            </button>
          </div>

          <div className='setting-main'>
            {activeTab === "account" && (
              <div className='settings-section'>
                <h2>Account Settings</h2>
                <div className='form-group'>
                  <label>Username</label>
                  <input
                    type='text'
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder='Enter username'
                  />
                </div>
                <div className='form-group'>
                  <label>Email Address</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder='Enter email address'
                  />
                </div>
                <div className='form-group'>
                  <label>Phone Number</label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder='Enter phone number'
                  />
                </div>
                <div className='form-row'>
                  <div className='form-group'>
                    <label>First Name</label>
                    <input
                      type='text'
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder='Enter first name'
                    />
                  </div>
                  <div className='form-group'>
                    <label>Last Name</label>
                    <input
                      type='text'
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder='Enter last name'
                    />
                  </div>
                </div>
                <div className='form-group'>
                  <label>Date of Birth</label>
                  <input
                    type='date'
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>
                <div className='form-group'>
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  >
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                    <option value='Prefer not to say'>Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className='settings-section'>
                <h2>Profile Information</h2>
                <div className='form-group'>
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder='Tell us about yourself'
                    rows='3'
                  />
                </div>
                <div className='form-group'>
                  <label>Location</label>
                  <input
                    type='text'
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder='Enter your location'
                  />
                </div>
                <div className='form-group'>
                  <label>Work</label>
                  <input
                    type='text'
                    value={formData.work}
                    onChange={(e) => handleInputChange("work", e.target.value)}
                    placeholder='Enter your work information'
                  />
                </div>
                <div className='form-group'>
                  <label>Education</label>
                  <input
                    type='text'
                    value={formData.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                    placeholder='Enter your education'
                  />
                </div>
                <div className='form-group'>
                  <label>Website</label>
                  <input
                    type='url'
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder='Enter your website URL'
                  />
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className='settings-section'>
                <h2>Privacy Settings</h2>
                <div className='form-group'>
                  <label>Profile Visibility</label>
                  <select
                    value={formData.privacy.profileVisibility}
                    onChange={(e) =>
                      handlePrivacyChange("profileVisibility", e.target.value)
                    }
                  >
                    <option value='public'>Public</option>
                    <option value='friends'>Friends Only</option>
                    <option value='private'>Private</option>
                  </select>
                </div>
                <div className='toggle-group'>
                  <div className='toggle-item'>
                    <span>Show Email Address</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.privacy.showEmail}
                        onChange={(e) =>
                          handlePrivacyChange("showEmail", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Show Phone Number</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.privacy.showPhone}
                        onChange={(e) =>
                          handlePrivacyChange("showPhone", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Show Birthday</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.privacy.showBirthday}
                        onChange={(e) =>
                          handlePrivacyChange("showBirthday", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Allow Friend Requests</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.privacy.allowFriendRequests}
                        onChange={(e) =>
                          handlePrivacyChange(
                            "allowFriendRequests",
                            e.target.checked
                          )
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Allow Messages</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.privacy.allowMessages}
                        onChange={(e) =>
                          handlePrivacyChange("allowMessages", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className='settings-section'>
                <h2>Notification Preferences</h2>
                <div className='toggle-group'>
                  <div className='toggle-item'>
                    <span>Email Notifications</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.email}
                        onChange={(e) =>
                          handleNotificationChange("email", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Push Notifications</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.push}
                        onChange={(e) =>
                          handleNotificationChange("push", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>SMS Notifications</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.sms}
                        onChange={(e) =>
                          handleNotificationChange("sms", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Friend Requests</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.friendRequests}
                        onChange={(e) =>
                          handleNotificationChange(
                            "friendRequests",
                            e.target.checked
                          )
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>New Messages</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.messages}
                        onChange={(e) =>
                          handleNotificationChange("messages", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Likes on Posts</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.likes}
                        onChange={(e) =>
                          handleNotificationChange("likes", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                  <div className='toggle-item'>
                    <span>Comments on Posts</span>
                    <label className='toggle'>
                      <input
                        type='checkbox'
                        checked={formData.notifications.comments}
                        onChange={(e) =>
                          handleNotificationChange("comments", e.target.checked)
                        }
                      />
                      <span className='slider'></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className='settings-actions'>
              <button className='btn-save' onClick={handleSave}>
                Save Changes
              </button>
              <button className='btn-cancel'>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setting;
