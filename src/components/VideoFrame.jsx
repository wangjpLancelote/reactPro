import React, {useRef, useEffect, useState, useCallback} from "react";
import styled from 'styled-components'
import { Image, Tag } from 'antd';
import './videoFrame.less';

const VideoDebugs = styled.div`
    width: 100%;
    height: 800px;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    .debugContainer {
        width: 600px;
        height: 360px;
        border: 1px solid #000;
        .player{
            width: 600px;
            height: 360px;
            position: relative;
          
          }
    }
    .imageList {
        width: 100%;
        height: 360px;
        border:1px solid #ccc;
        display:flex;
        flex-wrap: wrap;
        overflow:scroll;
        .imageItem {
            width: 200px;
            height: 160px;
            border-radius: 50%;
        }
    }
`;

function VideoFrame (props) {
    console.log('ddd', props);
    const isMultiple = props.multiple ? true : false //是否多选
    const isOnlyChild = React.Children.only(props.children)
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const format = props.format || 'png';
    
    const [images, setImages] = useState([]);

    useEffect(() => {
        videoRef.current.addEventListener('canplay', (e) => {
            videoRef.current.play();
            videoRef.current.addEventListener('seeked', seekDef)
        })
        return videoRef.current.removeEventListener('canplay', () => {

        });
    }, []);

    useEffect(() => {
        videoRef.current.addEventListener('mousemove', (e) => {
            console.log(e);
        })

        return videoRef.current.removeEventListener('mousemove', () => {

        })
    }, [])

    const uniq = (arr) => {
        return Array.from(new Set(arr));
    }

    const playVideo = () => {
        console.log('video', videoRef)
        if (videoRef.current.paused) {
            videoRef.current.play();
            return;
        }
        videoRef?.current.pause();
    }
    const seekDef = (e) => {
        videoRef.current.removeEventListener('seeked', () => {
            console.log('seeked event has removed');
        });
        // const video = document.createElement('video');
        // video.currentTime = videoRef.current.currentTime;
        // video.volume = videoRef.current.volume;
        // video.autoplay = true
        // video.muted = true // most browsers block autoplay unless muted
        // video.src = videoRef.current.src;
        // video.setAttribute('crossOrigin', 'anonymous');
        
        const { image, width, height, currentTime } = generateCanvas(videoRef.current);
        videoRef.current.pause();
        const base64Path = window.URL.createObjectURL(new Blob([image]));
        setImages((prev) => {
            if (!~prev.map(v => v.url).indexOf(base64Path)) {
                prev = [...prev, { url: base64Path, time: currentTime, width: width, height: height }]
            }
            return prev;
        });        
    }

    const generateCanvas = (video) => {
        const canvas = document.createElement('canvas')
        const width = canvas.width = videoRef.current.videoWidth;
        const height = canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataURI = canvas.toDataURL('image/' + format);
        const data = dataURI.split(',')[1];
        return {
            image: Buffer.from(data, 'base64'),
            currentTime: videoRef.current.currentTime,
            width,
            height
        }
    }

    return (
        <VideoDebugs>
            <div className="debugContainer" ref={containerRef}>
                <video ref={videoRef} width="100%" className="player" height="100%" src={require('./test.mp4').default} muted={true} controls crossOrigin="anonymous"/>
                <div className="control">
                    <div className="fa fa-play play_pause"></div>
                    <div>
                        <span className="progress"></span>
                    </div>
                    <div className="timer">
                        <span className="progress_timer">00:00:00</span>/
                        <span className="duration_timer">00:00:00</span>
                    </div>
                    <div className="fa fa-expand expand"></div>
                </div>
            </div>
            <div className="imageList">
                {
                    images.map((item, index) => {
                        return (
                            <div className="imageItem" key={index}>
                                <Image src={item.url}/>
                                <Tag color="#f50">{item.time}</Tag>
                            </div>
                        )
                    })
                }                
            </div>
        </VideoDebugs>
    )
}

export default VideoFrame;

