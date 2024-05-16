import React, { useState } from 'react';

function App(){
    const [image, setImage] = useState("");

    const submitImage = async () =>{
        const data = new FormData();
        data.append('file', image);
        data.append("upload_preset", "ke4rxjf5");
        data.append("cloud_name", "dommos90g");

        fetch("https://api.cloudinary.com/v1_1/dommos90g/image/upload",{
            method: "post",
            body: data
        }).then((res)=> res.json())
        .then((data)=>{
            console.log(data);
        }).catch((err)=>{
            console.log(err);
        });
    };

    return(
        <>
            <div>
                <div>
                    <input type="file" onChange={(e)=> setImage(e.target.files[0])}></input>
                    <button onClick={submitImage}>Upload</button>
                </div>
            </div>
        </>
    );
}

export default App;