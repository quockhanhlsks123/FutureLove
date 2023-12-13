import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Slider from "react-slick";

function HighlightVideo() {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    swipeToSlide: true,
    slidesToScroll: 2,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const userInfo = JSON.parse(window.localStorage.getItem("user-info"));
  const token = userInfo?.token;

  const [video, setVideo] = useState("");

  useEffect(() => {
    const randomCount = Math.floor(Math.random() * 20) + 1;

    axios
      .get(`https://metatechvn.store/lovehistory/video/${randomCount}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const errorMessage = "exceed the number of pages!!!";
        if (response.data === errorMessage) {
          // Nếu response.data trùng với chuỗi thông báo, hiển thị alert
          toast.error(errorMessage);
        } else {
          // Nếu không trùng, cập nhật state như bình thường
          setVideo(response.data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [token]);

  return (
    <>
      <div>
        {video && (
          <Slider {...settings}>
            {video.list_sukien_video.map((v) => (
              <div
                key={v.sukien_video[0].id_video}
                className="p-4 "
                style={{ height: "400px" }}
              >
                <Link to={`/detailVideo/${v.sukien_video[0].id_video}`}>
                  <video className="w-full h-auto" controls>
                    <source
                      src={v.sukien_video[0].link_vid_swap}
                      type="video/mp4"
                    />
                  </video>
                  <div className="text-sm font-semibold tracking-wide text-white uppercase">
                    {v.sukien_video[0].ten_su_kien}
                  </div>
                  <p className="mt-2 text-white">
                    {v.sukien_video[0].thoigian_taosk}
                  </p>
                </Link>
              </div>
            ))}
          </Slider>
        )}
      </div>
      <div className="flex justify-center items-center gap-[10px]">
        <Link
          to={"/video"}
          className="rounded-[100px] bg-white py-[16px] px-[40px] text-2xl cursor-pointer text-black"
        >
          More&gt;&gt;
        </Link>
      </div>
    </>
  );
}

export default HighlightVideo;
