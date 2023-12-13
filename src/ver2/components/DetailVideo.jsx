import React, { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import Header from "./Header";
import boy from "../components/image/Component131.png";
import { useParams } from "react-router";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const DetailVideo = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [video, setVideo] = useState("");
  const [goc, setGoc] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleImageClick = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://metatechvn.store/lovehistory/sukien/video/${id}`
        );
        console.log(response);
        setData(response.data.sukien_video[0]);
        setVideo(response.data.sukien_video[0].link_vid_swap);
        setGoc(response.data.sukien_video[0].link_video_goc);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchData1 = async () => {
      try {
        if (data && data.id_user) {
          const response = await axios.get(
            `https://metatechvn.store/profile/${data.id_user}`
          );
          console.log(response.data);
          setUser(response.data.user_name);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData1();
  }, [data.id_user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "linear-gradient(to right, #F0A3BF, #A86ED4)",
      }}
    >
      <Helmet>
        <meta
          property="og:image"
          content={data.link_image}
          data-react-helmet="true"
        />
      </Helmet>
      <Header />
      <p className="p-5 font-serif text-4xl italic font-medium text-white lg:text-5xl">
        Success, this is the result !!
      </p>
      <div className="flex flex-col items-center justify-center">
        <div
          style={{
            backgroundImage: `url(${boy})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
          className="lg:w-[150px] lg:h-[150px] w-[90px] h-[90px]"
        >
          <img
            onClick={handleImageClick}
            src={data.link_image}
            alt=""
            className="lg:w-[80%] lg:h-[80%] w-[80%] h-[80%] object-fill  rounded-full ml-2  mt-6 lg:mt-10 "
            style={{ position: "relative" }}
          />
        </div>
        <Link to={`/user/${data.id_user}`}>
          <p
            className="mt-2 font-serif text-white hover:text-red-500"
            style={{ fontSize: "2em" }}
          >
            {user}
          </p>
        </Link>

        <p className="font-serif text-white p-9" style={{ fontSize: "2em" }}>
          {data.ten_su_kien}
        </p>
        <p className="p-1 font-serif text-white" style={{ fontSize: "2em" }}>
          {data.thoigian_taosk}
        </p>
        <div className="flex">
          <div className="flex items-center justify-center w-1/2 mt-10">
            <div className="inline-block p-4 overflow-hidden border border-pink-500 rounded-lg shadow-lg">
              <video
                className="w-[270px] h-auto"
                controls
                key={id}
                src={video}
              ></video>
            </div>
          </div>
          <div className="flex items-center justify-center w-1/2 mt-10">
            <div className="inline-block p-4 overflow-hidden border border-pink-500 rounded-lg shadow-lg">
              <video
                className="w-[270px] h-auto"
                controls
                key={id}
                src={goc}
              ></video>
            </div>
          </div>
          {isModalVisible && (
            <div className="fixed z-50 flex flex-col items-center p-8 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg top-1/2 left-1/2">
              <button
                className="absolute text-gray-500 top-2 right-2 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                X
              </button>
              <div className="flex-grow"></div>
              <img
                className="h-auto max-w-full lg:max-w-lg md:max-w-md sm:max-w-sm"
                src={data.link_image}
                alt=""
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailVideo;
