import React, { useEffect, useCallback, useState } from "react";
// import ReactPlayer from 'react-player'; 
import { useSocket } from "../providers/socket";
import { usePeer } from "../providers/Peer";

const RoomPage = () => {
    const socket = useSocket();
    const {peer, createOffer, createAnswers, setRemoteAns, remoteStream, sendStream} = usePeer();

    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);

    const handleNewUserJoined = useCallback(
        async (data) => {
            const {emailId} = data;
            console.log('New User Joined Room', emailId);
            const offer = await createOffer();
            socket.emit("call-user", { emailId, offer });
            setRemoteEmailId(emailId);
        },
        [createOffer, socket]
    );

    const handleIncomingCall = useCallback(
            async(data) => {
            const {from, offer} = data;
            console.log("Incoming Call from ", from, offer);
            const ans = await createAnswers(offer);
            socket.emit("call-accepted", {emailId: from, ans});
            setRemoteEmailId(from);
        }, [createAnswers, socket]
    )

    const handleCallAccepted = useCallback(async (data) => {
        const {ans} = data;
        console.log("Call got Accepted", ans);
        await setRemoteAns(ans);

        // if (myStream) {
        //     sendStream(myStream);
        // }
    }, [setRemoteAns])

    useEffect(() => {
        socket.on("user-joined", handleNewUserJoined);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
         
        return () => {
            socket.off("user-joined", handleNewUserJoined);
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
        }
    }, [handleCallAccepted, handleIncomingCall, handleNewUserJoined, socket]);

    const getUserMediaStream = useCallback(async() => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true, video: true
        });
        
        setMyStream(stream);
    }, [setMyStream])

    // const handleNegosiation = useCallback(() => {
    //     const localOffer = peer;
    //     socket.emit('call-user', {emailId: remoteEmailId, offer: localOffer})
    // }, [peer, remoteEmailId, socket]);

        const handleNegosiation = useCallback(async () => {

            if (!peer || !remoteEmailId) return;

            const offer = await peer.createOffer();

            await peer.setLocalDescription(offer);

            socket.emit("call-user", {
                emailId: remoteEmailId,
                offer
            });

        }, [peer, remoteEmailId, socket]);

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegosiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegosiation)
        }
    }, [peer, handleNegosiation])

    useEffect(() => {
        if (myStream) sendStream(myStream);
    }, [myStream, sendStream]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream])

    return (
        <div className="room-page-container">
            <h1>Room Page</h1>
            <h4>You are conneted to {remoteEmailId}</h4>
            {/* <ReactPlayer url={myStream} playing/> */}
            {/* <button onClick={e => sendStream(myStream)}>Send my Video</button> */}
            <video
                ref={(video) => {
                    if (video && myStream) {
                        video.srcObject = myStream;
                    }
                }}
                autoPlay
                muted
                playsInline
                width="400"
            />        
            <video
                ref={(video) => {
                    if (video && remoteStream) {
                        video.srcObject = remoteStream;
                    }
                }}
                autoPlay
                muted
                playsInline
                width="400"
            />        
        </div>
    )
}

export default RoomPage;