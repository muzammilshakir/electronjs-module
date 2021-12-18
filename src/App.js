import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import { promises as fsp } from 'fs';
import moment from 'moment';
import './App.css';
import RegistrationForm from './registerForm';
var cron = require('node-cron');
const fs = window.require("fs"); 
const path = require("path");
const youtubeDownloader = require("ytdl-core");


const API_URL = 'https://i01-demo-server.herokuapp.com/'
let downloadDir = "./public/Download";



class App extends Component {
  constructor(props) {
    super(props) ;
    this.state = {
      activeVideoFile: 'FAST-AD',
      billboards: [],
      advertisements: [],
      schedules: [],
      downloadable: [],
      downloaded: [],
      registered: false
    }
    this.gettingData = this.gettingData.bind(this) ;
    this.download = this.download.bind(this) ;
  }
  componentDidMount() {
    this.gettingData() ;
    cron.schedule(`*/1 * * * *`, () => {
      const pulseStatus = (axios.post(API_URL + 'pulses', {
        'isAlive': true,
        
      })).data ;
      console.log("Pulse Sent: ", pulseStatus) ;
    });
    // download('https://www.youtube.com/watch?v=Wab1nHSrcx8&ab_channel=FAST-NU_Official', "FAST-AD") ;
  }
  gettingData = async() => {
    try {
      const downloadedJSON = await fsp.readFile(path.join(downloadDir, 'downloaded.json'), 'utf-8')
      const downloaded = JSON.parse(downloadedJSON)
      const billboards = await (await axios.get(API_URL + 'billboards')).data ;
      const advertisements = await (await axios.get(API_URL + 'advertisements')).data ;
      const schedules = await (await axios.get(API_URL + 'schedules')).data ;
      console.log(billboards) ;
      console.log(advertisements) ;
      console.log(schedules) ;
      console.log("Downloaded: ", downloaded) ;
      let downloadable = [] 
      for (let i = 0; i < advertisements.length ; i++) {
        let check = true ;
        for (let j = 0 ; j < downloaded.length ; j++) {
          if (downloaded[j].adName === advertisements[i].name ) {
            check = false ;
            break ;
          } 
        }
        if (check === true ) {
          downloadable.push(advertisements[i]) ;
        }
      }
      console.log("Downloadabled: ", downloadable) ;
      for (let d in downloadable) {
        console.log("VideoURL: ", downloadable[d]) ;
        this.download(downloadable[d].videoURL, downloadable[d].name) ; 
        
      }
      for (let s in schedules) {
        let check = true 
        for (let d in downloadable) {
          if (schedules[s].advertisementID.name === downloadable[d].name) {
            check = false 
          }
        }
        if (check) {
          console.log("Namessss: ", schedules[s].advertisementID.name )
          let m = moment(schedules[s].fromTime, "hh:mm").minutes()
          let h = moment(schedules[s].fromTime, "hh:mm").hours()
          cron.schedule(`${m} ${h} * * *`, () => {
            this.setState({
              activeVideoFile: schedules[s].advertisementID.name
            })
          });
          m = moment(schedules[s].toTime, "hh:mm").minutes()
          h = moment(schedules[s].toTime, "hh:mm").hours()
          cron.schedule(`${m} ${h} * * *`, () => {
            this.setState({
              activeVideoFile: 'FAST-AD' 
            })
          });
        }
      }
      // console.log("Schedule: ", schedules[0].fromTime) ;
      // console.log(moment(schedules[0].fromTime)) ;
      // console.log(moment(schedules[0].fromTime, "hh:mm").minutes()) ;
      this.setState({
        advertisements: advertisements,
        schedules: schedules,
        billboards: billboards,
        downloadable: downloadable,
        downloaded: downloaded
      })
    }
    catch(error) {
      console.log(error);
    }
  }
  download = (url, fileName) => {
    let extension;
    let options;
  
    extension = ".mp4";
    options = {
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
          response.on("data", async(data) => {
            dataRead += data.length;
            const percent = dataRead / totalSize;
            console.log("Percentage: ", percent) ;
            if (percent === 1) {
              const downloadedJSON = await fsp.readFile(path.join(downloadDir, 'downloaded.json'), 'utf-8');
              const downloaded = JSON.parse(downloadedJSON);
              const updatedDownloaded = [...downloaded, {adName: fileName, fileName: fileName + extension, downloaded: true}] ;
              const updatee = await fsp.writeFile(path.join(downloadDir, 'downloaded.json'), JSON.stringify(updatedDownloaded))
              this.setState({
                downloaded: updatedDownloaded,
              });
            }
          }); 
        });
  
        youtube.on("error", () => {
          reject(new Error(`There was an error while downloading ${title} ${fileName}`));
        });
  
        youtube.on("end", () => {
          resolve({ message: `${fileName} / ${title} finished downloading with success` });
          // line.destroy();
        });
  
        youtube.pipe(
          fs.createWriteStream(path.join(downloadDir, `${fileName}${extension}`))
        );
      });
    });
  };
  // schedulingJobs = () => {
  //   let playable = [] 
  //   for (let s in this.state.schedules) {

  //   }
  // }
  changeRegister = () =>{
    this.setState({registered:true})
    console.log("REGISTER SATATE",this.state.registered)
  }

  render() {
    return ( 
      <div className="App">
        {/* {this.state.registered ? 
        <> */}
        <RegistrationForm registered = {this.state.registered} changeRegister={this.changeRegister}/>
        {/* </> 
        :
        <>
        <ReactPlayer
          url= {'./Download/' + this.state.activeVideoFile + '.mp4'}
          width = '100%'
          height = '100%'
          playing = {true}
          muted = { true }
          loop = { true }
        />
        </>
        } */}
        
       
      </div>
    );
  }
}

export default App;
