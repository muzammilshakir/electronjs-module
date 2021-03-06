import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getSchedules, getBillboards } from './utils/index';
import ReactPlayer from 'react-player';
import { readFromBillboardFile } from "./utils/index";
import moment from 'moment';
import './App.css';
import RegistrationForm from './registerForm';
import axios from "axios";
var cron = require('node-cron');
const API_URL = "https://admag-server.herokuapp.com/api";

function App() {
  // const { isLoading: isLoadingSc, isSuccess: isSuccessSc, data: gSchedules } = useQuery("schedule", getSchedules);
  // const { isLoading: isLoadingBil, isSuccess: isSuccessBil, data: gBillboards } = useQuery("billboard", getBillboards);
  const [isLoadingSc, setIsLoadingSc] = useState(true);
  const [isLoadingBil, setIsLoadingBil] = useState(true);
  const [isSuccessSc, setIsSuccessSc] = useState(false);
  const [isSuccessBil, setIsSuccessBil] = useState(false);
  const [gSchedules, setGSchedules] = useState([]);
  const [gBillboards, setGBillboards] = useState([]);

  const [online, setOnline] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [allAds, setAllAds] = useState([
    {
      id: " ",
      fileName: "./Download/FAST-AD.mp4",
      type: "Video",
      scheduleID: null,
    }
  ]);
  useEffect(() => {
    const checkingAlreadyRegistered = async () => {
      let billID = await readFromBillboardFile();
      if (billID === "") setRegistered(false);
      else setRegistered(true);
      cron.schedule(`*/1 * * * *`, () => {
        let _billID = billID === "" ? null : billID;
        let _scheduleID = allAds[activeAdIndex].scheduleID
        console.log(allAds[activeAdIndex]) ;
        // let _scheduleID = allAds[activeAdIndex].scheduleID === " " ? null : allAds[activeAdIndex].scheduleID;
        // let _scheduleID = allAds[activeAdIndex].scheduleID === " " ? null : allAds[activeAdIndex].scheduleID;
        axios.post(API_URL + '/pulse', {
          'isAlive': true,
          'billboard': _billID,
          'schedule': _scheduleID
        });
      });
    }
    const fetchingData = async () => {
      let _billboards = await getBillboards();
      let _schedules = await getSchedules();
      setGSchedules(_schedules);
      setGBillboards(_billboards);
      setIsSuccessSc(true);
      setIsSuccessBil(true);
      setIsLoadingSc(false);
      setIsLoadingBil(false);
      
    }
    checkingAlreadyRegistered();
    fetchingData();
  }, [])
  useEffect(() => {
    console.log({isLoadingBil, isSuccessBil})
    if (!isLoadingBil && isSuccessBil) {
      const currentTime = moment();
      const fromTime = moment();
      const toTime = moment();
      // Thu Apr 21 2022 13:30:48 GMT+0500
      const fromTimeBillboard = moment(gBillboards.fromActiveTime, "ddd MMM DD YYYY HH:mm:ss Z");
      const toTimeBillboard = moment(gBillboards.toActiveTime, "ddd MMM DD YYYY HH:mm:ss Z");
      // console.log({
      //   hour: toTimeBillboard.hour(),
      //   minute: toTimeBillboard.minute(),
      //   second: toTimeBillboard.second(),
      // });
      fromTime.set({
        hour: fromTimeBillboard.hour(),
        minute: fromTimeBillboard.minute(),
        second: fromTimeBillboard.second(),
      });
      toTime.set({
        hour: toTimeBillboard.hour(),
        minute: toTimeBillboard.minute(),
        second: toTimeBillboard.second(),
      });
      // console.log("fromTime: ", fromTimeBillboard);
      // console.log("toTime: ", toTimeBillboard);
      // console.log("fromTime: ", fromTime);
      // console.log("toTime: ", toTime);
      let mt = toTime.minutes();
      let ht = toTime.hours();
      let dmt = toTime.date() ;
      let mf = fromTime.minutes();
      let hf = fromTime.hours();
      let dmf = fromTime.date() ;
      if (fromTime.isBefore(currentTime) && toTime.isAfter(currentTime)) {
        console.log("Hello Wodd rld !");
        setOnline(true);
        cron.schedule(`${mt} ${ht} ${dmt} * *`, () => {
          setOnline(false);
        });
      }
      else if (currentTime.isAfter(toTime)) {
        setOnline(false);
        cron.schedule(`${mf} ${hf} ${dmf} * *`, () => {
          setOnline(true);
        });
      }
      else if (fromTime.isBefore(currentTime)) {
        setOnline(false);
        cron.schedule(`${mf} ${hf} ${dmf} * *`, () => {
          setOnline(true);
        });
      }
    }
  }, [isLoadingBil])
  useEffect(() => {
    const schedulingAdvertisements = async () => {
      if (!isLoadingSc && !isLoadingBil && isSuccessBil && isSuccessSc) {
        let _allAds = allAds;
        
        let noSchedule = true ;
        for (let i = 0; i < gSchedules.length; i++) {
          let currentTime = moment(); 
          let _gapTime = moment().add(5, 'minutes');
          let fromTime = moment(gSchedules[i].fromDateTime, "ddd MMM DD YYYY HH:mm:ss Z");
          console.log(fromTime.isValid()) ;
          if (fromTime.isAfter(currentTime) && fromTime.isBefore(_gapTime)) {
            console.log(gSchedules[i]) ;
            let adIndex = _allAds.length;
            _allAds.push({
              id: gSchedules[i].advertisement._id,
              fileName: gSchedules[i].advertisement.isStatic ? 
                        `https://brilliant-dev-pro.s3.ap-south-1.amazonaws.com/${gSchedules[i].advertisement.imageURL}` : 
                        `https://brilliant-dev-pro.s3.ap-south-1.amazonaws.com/${gSchedules[i].advertisement.videoURL}`,
              type: gSchedules[i].advertisement.isStatic ? "Image" : "Video",
              scheduleID: gSchedules[i]._id,
            });
            let mf = moment(gSchedules[i].fromDateTime, "ddd MMM DD YYYY HH:mm:ss Z").minutes();
            let hf = moment(gSchedules[i].fromDateTime, "ddd MMM DD YYYY HH:mm:ss Z").hours();
            let dmf = moment(gSchedules[i].fromDateTime, "ddd MMM DD YYYY HH:mm:ss Z").date() ;
            let mt = moment(gSchedules[i].toDateTime, "ddd MMM DD YYYY HH:mm:ss Z").minutes();
            let ht = moment(gSchedules[i].toDateTime, "ddd MMM DD YYYY HH:mm:ss Z").hours();
            let dmt = moment(gSchedules[i].toDateTime, "ddd MMM DD YYYY HH:mm:ss Z").date() ;
            console.log(mf, hf, mt, ht);
            cron.schedule(`${mf} ${hf} ${dmf} * *`, () => {
              setActiveAdIndex(adIndex);
            });
            cron.schedule(`${mt} ${ht} ${dmt} * *`, async() => {
              setActiveAdIndex(0);
              setIsSuccessSc(false);
              setIsSuccessBil(false);
              setIsLoadingSc(true);
              setIsLoadingBil(true);
              let _billboards = await getBillboards();
              let _schedules = await getSchedules();
              setGSchedules(_schedules);
              setGBillboards(_billboards);
              setIsSuccessSc(true);
              setIsSuccessBil(true);
              setIsLoadingSc(false);
              setIsLoadingBil(false);
            });
            noSchedule = false ;
            break ;
          }

        }
        if (noSchedule) {
          var _current = moment();
          var _currentMinutes = _current.minutes();
          var _currentHours = _current.hours();
          var _currentDate = _current.date();
          cron.schedule(`${_currentMinutes + 2} ${_currentHours} ${_currentDate} * *`, async() => {
            setActiveAdIndex(0);
            setIsSuccessSc(false);
            setIsSuccessBil(false);
            setIsLoadingSc(true);
            setIsLoadingBil(true);
            let _billboards = await getBillboards();
            let _schedules = await getSchedules();
            setGSchedules(_schedules);
            setGBillboards(_billboards);
            setIsSuccessSc(true);
            setIsSuccessBil(true);
            setIsLoadingSc(false);
            setIsLoadingBil(false);
          });
        }
        setAllAds([..._allAds]);
      }
    }
    schedulingAdvertisements();
  }, [isLoadingSc, isLoadingBil])


  return (
    <div className="App">
      {
        ((isLoadingBil || isLoadingSc) && (!isSuccessBil || !isSuccessSc)) ?
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
                      allAds[activeAdIndex].type === "Video" ?
                        <ReactPlayer
                          // url={'./Download/' + allAds[activeAdIndex].id + '.mp4'}
                          url={allAds[activeAdIndex].fileName}
                          // url = "./Download/FAST-AD.mp4"
                          width='100%'
                          height='100%'
                          playing={true}
                          muted={true}
                          loop={true}
                        />
                        :
                        <img alt="Offline Mode" src={allAds[activeAdIndex].fileName} width="100%" />
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
