console.log(faceapi);

const run = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    });

    const video = document.getElementById('video');
    video.srcObject = stream;

    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('../FaceRecognization/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('../FaceRecognization/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('../FaceRecognization/models'),
        faceapi.nets.ageGenderNet.loadFromUri('../FaceRecognization/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('../FaceRecognization/models'),

    ]);

    const canvas = document.getElementById('canvas');
    canvas.style.left = video.offsetLeft+'px';
    canvas.style.top = video.offsetTop+'px';
    canvas.height = video.height;
    canvas.width = video.width;

    // add reference image
    let refImg = '../FaceRecognization/ActualImages/jayraj.jpg';
    const refImage = await faceapi.fetchImage(refImg);
    // const refImage = await faceapi.detectAllFaces(refImg).withFaceLandmarks().withFaceDescriptors();
    if (!refImage.length) {
        // console.log(refImage);
        // debugger;
    }

    // compare with current image
    let refFaceData = await faceapi.detectAllFaces(refImage).withFaceLandmarks().withFaceDescriptors();



    let faceMatcher = new faceapi.FaceMatcher(refFaceData)


    setInterval(async()=>{

        let faceData = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors().withAgeAndGender().withFaceExpressions();

        // console.log(faceData);

        canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height);
        faceData = faceapi.resizeResults(faceData, video);
        faceapi.draw.drawDetections(canvas, faceData);
        faceapi.draw.drawFaceLandmarks(canvas, faceData);
        faceapi.draw.drawFaceExpressions(canvas, faceData);

        faceData.forEach(face => {
            const {age, gender, genderProbability, detection, descriptor} = face;
            const genderText = `${gender} - ${Math.round(genderProbability * 100 )/100*100}`
            const ageText = `${Math.round(age )} - years`;
            const textField = new faceapi.draw.DrawTextField([genderText, ageText], face.detection.box.topRight);
            textField.draw(canvas);


            let label = faceMatcher.findBestMatch(descriptor).toString();
            // console.log(label);

            let option = {label: "Jayraj"};
            if(label.includes('unknown')){
                option.label = "Unknown"
            }
            const textField1 = new faceapi.draw.DrawBox(detection.box,option);
            textField1.draw(canvas);

        });

    }, )
}

run();