import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  // State to store selected profile image
  const [selectedImg, setSelectedImg] = useState(null);

  // State for user name and bio
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);

  const navigate = useNavigate();

  // Handle form submission (save profile)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Redirect to home page after submission
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center bg-[url('./src/assets/bgImage.jpg')] p-4">
      {/* Main container for form and logo, responsive and styled */}
      <div className="w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex gap-6 justify-between rounded-lg max-sm:flex-col-reverse max-sm:items-center overflow-hidden">
        {/* -------- Form Area -------- */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-8 flex-1 w-full"
        >
          {/* Section Title */}
          <h3 className="text-lg font-semibold">Profile Details</h3>

          {/* Avatar Upload */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Hidden file input */}
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />
            {/* Preview image */}
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt="avatar"
              className={`w-12 h-12 object-cover ${
                selectedImg && "rounded-full"
              }`}
            />
            Upload profile image
          </label>

          {/* Name input field */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Bio textarea */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile Bio"
            required
            rows={4}
            className="p-2 border border-gray-500 rounded-md bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          ></textarea>

          {/* Submit button */}
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-purple-400 to-violet-600 text-white py-2 rounded-full font-medium hover:opacity-90"
          >
            Save
          </button>
        </form>

        {/* -------- Logo Area -------- */}
        <div className="flex items-center justify-center p-6 max-w-[260px] w-full">
          {/* Company or app logo */}
          <img
            src={authUser?.profilePic || assets.logo_icon}
            alt="Logo"
            className={`w-full h-auto object-contain rounded-full ${
              selectedImg && "rounded-full"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
