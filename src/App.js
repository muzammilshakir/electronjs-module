import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getSchedules, getAdvertisemnets, getBillboards } from './utils/index';
import ReactPlayer from 'react-player';
import { readFromBillboardFile, readFromDownloadFile, writeToDownloadFile } from "./utils/index";
import moment from 'moment';
import './App.css';
import RegistrationForm from './registerForm';
import axios from "axios";
var cron = require('node-cron');
const fs = window.require("fs");
const path = require("path");
const youtubeDownloader = require("ytdl-core");

let downloadDir = "./public/Download";
const API_URL = "https://admag-server.herokuapp.com/api";

function App() {
  // const { mutate: createPulse } = useMutation(addPulse);
  const { isLoading: isLoadingSc, isSuccess: isSuccessSc, data: gSchedules } = useQuery("schedule", getSchedules);
  const { isLoading: isLoadingAd, isSuccess: isSuccessAd, data: gAdvertisemnets } = useQuery("advertisement", getAdvertisemnets);
  const { isLoading: isLoadingBil, isSuccess: isSuccessBil, data: gBillboards } = useQuery("billboard", getBillboards);
  const [online, setOnline] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [allAds, setAllAds] = useState([
    {
      id: "FAST-AD",
      downloaded: true,
      scheduleID: " ",
    }
  ]);
  useEffect(() => {
    const checkingAlreadyRegistered = async () => {
      let billID = await readFromBillboardFile();
      if (billID === "") setRegistered(false);
      else setRegistered(true);
      cron.schedule(`*/1 * * * *`, () => {
        axios.post(API_URL + '/pulse', {
          'isAlive': true,
          'billboardID': billID,
        });
      });
    }
    checkingAlreadyRegistered();
  },[])
  useEffect(() => {
    if (!isLoadingBil && isSuccessBil) {
      const currentTime = moment().format('hh:mm');
      let mt = moment(gBillboards.toActiveTime, "hh:mm").minutes()
      let ht = moment(gBillboards.toActiveTime, "hh:mm").hours()
      let mf = moment(gBillboards.fromActiveTime, "hh:mm").minutes()
      let hf = moment(gBillboards.fromActiveTime, "hh:mm").hours()
      if (gBillboards.fromActiveTime <= currentTime && gBillboards.toActiveTime > currentTime) {
        setOnline(true);
        cron.schedule(`${mt} ${ht} * * *`, () => {
          setOnline(false);
        });
      }
      else if (gBillboards.toActiveTime <= currentTime) {
        setOnline(false);
        cron.schedule(`${mf} ${hf} * * *`, () => {
          setOnline(true);
        });
      }
      else if (gBillboards.fromActiveTime > currentTime) {
        setOnline(false);
        cron.schedule(`${mf} ${hf} * * *`, () => {
          setOnline(true);
        });
      }
    }
  }, [isLoadingBil])
  useEffect(() => {
    const download = (url, fileName, adIndex) => {
      let extension = ".mp4";
      let options = {
        quality: "highest",
        filter: (format) => format.container === "mp4",
      };
      return new Promise((resolve, reject) => {
        const metadata = youtubeDownloader.getInfo(url);
        metadata.then((value) => {
          const { title } = value;
          const youtube = youtubeDownloader.downloadFromInfo(value, options);
          youtube.on("response", (response) => {
            const totalSize = response.headers["content-length"];
            let dataRead = 0;
            response.on("data", async (data) => {
              dataRead += data.length;
              const percent = dataRead / totalSize;
              console.log("Filename: ", fileName, " Percentage: ", percent);
              if (percent === 1) {
                const downloaded = await readFromDownloadFile();
                downloaded.push({
                  id: fileName,
                  downloaded: true,
                });
                await writeToDownloadFile(downloaded);
                let _allAds = allAds;
                _allAds[adIndex].downloaded = true;
                setAllAds([..._allAds]);
              }
            });
          });

          youtube.on("error", () => {
            reject(new Error(`There was an error while downloading ${title} ${fileName}`));
          });

          youtube.on("end", () => {
            resolve({ message: `${fileName} / ${title} finished downloading with success` });
          });

          youtube.pipe(
            fs.createWriteStream(path.join(downloadDir, `${fileName}${extension}`))
          );
        });
      });
    };
    const schedulingAdvertisements = async () => {
      if (!isLoadingSc && !isLoadingAd && !isLoadingBil && isSuccessBil && isSuccessAd && isSuccessSc) {
        let downloadedAds = await readFromDownloadFile();
        let _allAds = allAds;
        for (let i = 0; i < gSchedules.length; i++) {
          for (let j = 0; j < gAdvertisemnets.length; j++) {
            if (gAdvertisemnets[j]._id === gSchedules[i].advertisementID) {

              let adStatus = downloadedAds.filter((ad) => {
                return ad.id === gAdvertisemnets[j]._id
              });
              let adIndex = _allAds.length;
              if (adStatus.length === 0) {
                _allAds.push({
                  id: gAdvertisemnets[j]._id,
                  downloaded: false,
                  scheduleID: gSchedules[i]._id,
                });
                download(gAdvertisemnets[j].videoURL, gAdvertisemnets[j]._id, adIndex);
              }
              else {
                _allAds.push({
                  id: gAdvertisemnets[j]._id,
                  downloaded: true,
                  scheduleID: gSchedules[i]._id,
                });
              }
              let mf = moment(gSchedules[i].fromDateTime).format("mm");
              let hf = moment(gSchedules[i].fromDateTime).format("hh");
              let mt = moment(gSchedules[i].toDateTime).format("mm");
              let ht = moment(gSchedules[i].toDateTime).format("hh");
              cron.schedule(`${mf} ${hf} * * *`, () => {
                setActiveAdIndex(adIndex);
              });
              cron.schedule(`${mt} ${ht} * * *`, () => {
                setActiveAdIndex(0);
              });
            }
          }
        }
        setAllAds([..._allAds]);
      }
    }
    schedulingAdvertisements();
  }, [isLoadingSc, isLoadingBil, isLoadingAd])


  return (
    <div className="App">
      {
        ((isLoadingAd || isLoadingBil || isLoadingSc) && (!isSuccessBil || !isSuccessSc || !isSuccessAd)) ?
          <img
            alt="Page Loading"
            src={'./Download/page-load.jpg'}
            width="100%"
            height="100%"
          />
          :
          <>
            {!registered ?
              <>
                <RegistrationForm registered={registered} setRegistered={setRegistered} />
              </>
              :
              <>
                {online ?
                  <>
                    {
                      allAds[activeAdIndex].downloaded ?
                        <>
                          <ReactPlayer
                            url={'./Download/' + allAds[activeAdIndex].id + '.mp4'}
                            width='100%'
                            height='100%'
                            playing={true}
                            muted={true}
                            loop={true}
                          />
                        </>
                        :
                        <>
                          <img alt="Downloading" src={'./Download/downloading.jpg'} width="100%" height="100%" />
                        </>
                    }
                  </>
                  :
                  <img alt="Offline Mode" src={'./Download/offline.webp'} width="75.5%" height="100%" />
                }
              </>
            }
          </>
      }


    </div>
  );

}

export default App;
