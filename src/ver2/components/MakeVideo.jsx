import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import boy from "../components/image/nam.png";
import nen from "../components/image/phucnen1.png";
import ReactLoading from "react-loading";
import "react-toastify/dist/ReactToastify.css";
import * as faceapi from "face-api.js";
import "../css/AddEvent.css";
import RenderRandomWaitImage from "../components/randomImages";
import { ToastContainer, toast } from "react-toastify";
import heart from "../components/image/heart.png";
import { useDispatch } from "react-redux";
import "@tensorflow/tfjs";
import * as ml5 from "ml5";

function MakeVideo() {
  const imageModelURL =
    "https://teachablemachine.withgoogle.com/models/BlP1OZ89F/";
  const classifierRef = useRef(null);
  const [showModal, setShowModal] = React.useState(false);
  const [nam1, setBoy] = useState(boy);
  const [image1, setImage1] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImg, setShowImg] = useState({ img1: null });
  const [randomImages, setRandomImages] = useState(null);
  const [modelAlert, setModelAlert] = useState({ status: false, message: "" });
  const userInfo = JSON.parse(window.localStorage.getItem("user-info"));
  const token = userInfo && userInfo.token;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    loadModels();
  }, []);
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
    ]).then(() => {});
  };

  const idUser = userInfo && userInfo.id_user;
  const getMyDetailUser = async () => {
    try {
      const { data } = await axios.get("https://api.ipify.org/?format=json");

      if (data.ip) {
        const browser = window.navigator.userAgent;
        return {
          browser: browser,
          ip: data.ip,
        };
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
  const closeUploadImg = async () => {
    setImage1(null);
    setShowModal(false);
    setIsLoading(false);
    setShowImg({ img1: null });
    document.querySelector("#img1").value = "";
    return;
  };
  const validImage = async (image) => {
    try {
      const imageElement = document.createElement("img");
      imageElement.src = image;
      const netInput = imageElement;
      let detections = await faceapi
        .detectAllFaces(netInput, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const detections2 = await faceapi
        .detectAllFaces(netInput, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 1) return detections;
      if (detections2.length == 0) return detections2;
      if (detections2.length == 1) return detections2;
      return detections;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadImageClassifier();
  }, []);

  async function loadImageClassifier() {
    try {
      setIsLoading(true);
      const model = await ml5.imageClassifier(imageModelURL + "model.json");
      console.log(model);
      if (model) {
        setIsLoading(false);
        classifierRef.current = model;
      }
    } catch (error) {
      console.error("Error loading model: ", error);
    }
  }

  const classifyUploadedFile = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (classifierRef.current) {
          classifierRef.current.classify(img, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results[0].label);
            }
          });
        }
      };
    });
  };

  const [imageVid, setImageVid] = useState("");
  const handleChangeImage = async (event, setImage, atImg) => {
    let file = event.target.files[0];
    if (!file) {
      return;
    }
    setIsLoading(true);
    try {
      if (!URL.createObjectURL(file)) return setShowModal(true);
      const label = await classifyUploadedFile(file);
      console.log(label);
      if (label === "Correct: Mask On") {
        setIsLoading(false);
        closeUploadImg();
        setModelAlert({
          status: true,
          message: "Please choose a photo without a mask",
        });
        return;
      }
      const res = await validImage(URL.createObjectURL(file));
      if (res.length == 0) {
        setIsLoading(false);
        closeUploadImg();
        return setModelAlert({
          status: true,
          message: "No faces can be recognized in the photo",
        });
      }
      if (res.length > 1) {
        setIsLoading(false);
        closeUploadImg();
        return setModelAlert({
          status: true,
          message: "Photos must contain only one face",
        });
      }

      setIsLoading(false);
      if (atImg == "img1") {
        let send = showImg;
        send.img1 = URL.createObjectURL(file);
        setShowImg(send);
        setImage(file);
        const imagevid = await uploadImage(file);
        setImageVid(imagevid);
      }
    } catch (error) {
      console.log(error);
      setShowModal(true);
      setIsLoading(false);
      closeUploadImg();
    }
  };

  const [tenVideo, setTenVideo] = useState();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const link = queryParams.get("link");

  const history = useNavigate();

  const uploadImage = async (image1) => {
    if (idUser === null) {
      toast.warning("Login is required");
      navigate("/login");
    }
    const formData = new FormData();
    formData.append("src_img", image1);

    try {
      if (image1) {
        // Gửi cả hai hình ảnh lên server
        const apiResponse = await axios.post(
          `https://metatechvn.store/upload-gensk/${idUser}?type=src_vid`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return apiResponse.data; // Trả về dữ liệu từ API
      }
      return null;
    } catch (error) {
      toast.warning(error);
      return null;
    }
  };

  const fetchData = async () => {
    if (!tenVideo || !tenVideo.trim()) {
      toast.warning("Enter Name Video!");
      return;
    }

    setIsLoading(true);
    try {
      const device = await getMyDetailUser();

      const response = await axios.get(
        `https://lhvn.online/getdata/genvideo?id_video=${id}&device_them_su_kien=${device.browser}&ip_them_su_kien=${device.ip}&id_user=${idUser}&image=${imageVid}&ten_video=${tenVideo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      dispatch({
        type: "SET_RESPONSE_DATA",
        payload: response.data,
      });
      history(`/detailVideo/${response.data.sukien_video.id_sukien_video}`);
      // toast.success("Successful");
    } catch (error) {
      toast.warning(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {}, [image1]);
  const renderLoading = () => {
    if (isLoading) {
      return (
        <div className="fixed top-0 min-w-[100%] h-[100vh] z-30">
          <div className="absolute top-0 min-w-[100%] h-[100vh] bg-red-500 opacity-30 z-10"></div>
          <div
            style={{
              display: "flex",
              justifyContent: "right",
              alignItems: "center",
            }}
            className="absolute z-20 opacity-100 -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4"
          >
            <ReactLoading type={"bars"} color={"#C0C0C0"} />
          </div>
        </div>
      );
    }
    return null;
  };

  const funcModelAlert = () => {
    if (modelAlert.status) {
      return (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative max-w-3xl mx-auto my-6 w-96">
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                <div className="relative flex-auto p-6">
                  <p className="my-4 text-3xl leading-relaxed text-slate-500 slab">
                    {modelAlert.message}
                  </p>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-slate-200">
                  <button
                    className="text-[#FF2C61] slab hover:bg-[#ED709D] hover:text-white font-bold uppercase px-6 py-3 rounded-xl text-2xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      setModelAlert({ status: false, message: "" });
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      );
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${nen})`,
        minHeight: "100vh",
        minWidth: "100vw",
      }}
      className="bg-no-repeat bg-cover"
    >
      <Header />
      {randomImages !== null && (
        <RenderRandomWaitImage images1={randomImages} />
      )}
      {isLoading ? renderLoading() : ""}
      {modelAlert.status ? funcModelAlert() : ""}
      <div className="flex flex-col lg:flex-row">
        <div className="p-4 lg:w-1/2">
          <div className="flex items-center justify-center font-serif font-semibold">
            <input
              type="text"
              placeholder="Name Video"
              className="p-2 mb-4 border rounded-lg"
              value={tenVideo}
              onChange={(e) => setTenVideo(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center pb-32 lg:mx-52">
            <div
              style={{
                backgroundImage: `url(${nam1})`,
                height: `411px`,
                width: `410px`,
              }}
              alt=""
              className="relative responsiveImg"
            >
              <div
                className="responsiveImg absolute cursor-pointer w-[331px] h-[331px] rounded-[50%] mt-110 ml-6 bg-center bg-no-repeat bg-cover bottom-0 mb-[14px]"
                style={
                  showImg.img1
                    ? { backgroundImage: `url(${showImg.img1})` }
                    : null
                }
              ></div>
              <input
                onChange={(e) => {
                  handleChangeImage(e, setImage1, "img1");
                }}
                style={
                  showImg.img1
                    ? { backgroundImage: `url(${showImg.img1})` }
                    : null
                }
                type="file"
                accept="image/*"
                id="img1"
                className={
                  image1
                    ? " opacity-0 responsiveImg cursor-pointer w-[331px] h-[331px] rounded-[50%] mt-110 ml-6 bg-center bg-no-repeat bg-cover"
                    : " opacity-0 cursor-pointer w-[331px] h-[331px] rounded-[50%] absolute mt-110 ml-6 bg-center bg-no-repeat bg-black"
                }
              />
            </div>
          </div>
          <div
            onClick={() => fetchData()}
            className="flex items-center justify-center transition-transform duration-300 hover:scale-125 "
          >
            <img
              src={heart}
              alt=""
              className="bg-center bg-no-repeat cursor-pointer lg:w-48 lg:h-44"
            />
          </div>
        </div>

        <div className="p-4 lg:w-1/2">
          <div className="flex flex-col">
            <div className="flex items-center justify-center">
              <div className="inline-block p-2 text-center border border-gray-300 rounded-lg shadow-lg">
                <video className="w-full h-auto" controls>
                  <source src={link} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MakeVideo;
