import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import folder1 from '../images/folder.png';
import folder2 from '../images/folder2.png';
import uploadImage from '../images/uploadImage.png';
import image2 from '../images/image.png';
import imageSearch from '../images/imageSearch.png';
import '../App.css';
import { Toaster, toast } from 'react-hot-toast';

import startmenu from "../images/building.png";
import fileExplorer from "../images/folder3.png";
import browser from "../images/globe.png"
import volume from "../images/volume-up.png";
import network from "../images/wifi.png";
import calendar from "../images/calendar.png";
import settings from "../images/settings.png";
import Draggable from 'react-draggable';

import bg1 from '../images/bg1.jpg';


const Home = () => {

    const buttonHoverClass = "hover:scale-110";
    const navigate = useNavigate();
    const [folderName, setFolderName] = useState('');
    const [folders, setFolders] = useState([]);
    const [image, setImage] = useState(null);
    const [folderImages, setFolderImages] = useState({});
    const [imageName, setImageName] = useState('');
    const isUploadButtonDisabled = !imageName || !image;
    const [folderId, setFolderId] = useState('');
    const [openFolder, setOpenFolder] = useState(false);
    const [createFolderPrompt, setCreateFolderPrompt] = useState(false);
    const [fName, setfName] = useState('');
    const [imagePrompt, setImagePrompt] = useState(false);
    const [imageClicked, setImageClicked] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [searchClicked, setsearchClicked] = useState(false);
    const [userImages, setUserImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredImages, setFilteredImages] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            try {
                const user = jwtDecode(token);
                if (!user) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    fetchFolders();
                    fetchUserImages();
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [navigate]);

    async function fetchUserImages() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://dobbyserver.onrender.com/api/imagesAll', {
                headers: {
                    'x-access-token': token
                }
            });
            const data = await response.json();
            if (data.status === 'ok') {
                setUserImages(data.images);
                console.log(data.images);
                console.log(userImages)
            } else {
                console.error('Failed to fetch user images:', data.error);
            }
        } catch (error) {
            console.error('Error fetching user images:', error);
        }
    }


    async function fetchFolders() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://dobbyserver.onrender.com/api/folders', {
                headers: {
                    'x-access-token': token
                }
            });
            const data = await response.json();
            if (data.status === 'ok') {
                setFolders(data.folders);
            } else {
                console.error('Failed to fetch folders:', data.error);
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    }

    async function fetchImages(folderId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://dobbyserver.onrender.com/api/images/${folderId}`, {
                headers: {
                    'x-access-token': token,
                },
            });
            const data = await response.json();
            if (data.status === 'ok') {
                setFolderImages(prevState => ({
                    ...prevState,
                    [folderId]: data.images
                }));
                
            } else {
                console.error('Failed to fetch images:', data.error);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }

    async function createFolder(e, parentFolderId) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://dobbyserver.onrender.com/api/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({ name: folderName, parentFolderId })
            });
            const data = await response.json();
            if (data.status === 'ok') {
                toast.success("Folder created successfully!");
                setFolderName('');
                const updatedFolders = [...folders];
                if (!parentFolderId) {
                    updatedFolders.push(data.folder);
                } else {
                    updateSubfolders(updatedFolders, parentFolderId, data.folder);
                }
                setFolders(updatedFolders);
                await fetchFolders();
                setCreateFolderPrompt(false); // Close the create folder prompt
            } else {
                toast.error("File name must be unique")
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            toast.error('Failed to create folder');
        }
    }

    function updateSubfolders(updatedFolders, parentFolderId, newFolder) {
        updatedFolders.forEach(folder => {
            if (folder._id === parentFolderId) {
                if (!folder.subfolders) {
                    folder.subfolders = [];
                }
                folder.subfolders.push(newFolder);
            } else if (folder.subfolders) {
                const foundFolder = folder.subfolders.find(subfolder => subfolder._id === parentFolderId);
                if (foundFolder) {
                    updateSubfolders(foundFolder.subfolders, parentFolderId, newFolder);
                }
            }
        });
    }

    function folderTriggered(folderName, folders) {
        console.log(folders);
        const clickedFolder = folders.find(folder => folder.name === folderName);
        setfName(clickedFolder.name);
        // Check if the clicked folder exists and has subfolders
        if (clickedFolder) {
            // Update the state to open the folder and set the subfolders
            setOpenFolder(true);
            const clickedFolderId = clickedFolder._id; // Store the ID of the clicked folder
            console.log(clickedFolderId);
            setFolderId(clickedFolderId);
        } else {
            // If the clicked folder has no subfolders or doesn't exist, log a message
            console.log("No subfolders found for", folderName);
        }
    }

    function imageTriggered(image) {
        console.log(image.url);
        setImageClicked(true);
        setImageUrl(image.url);

    }

    

    async function submitImage(folderName) {
    const data = new FormData();
    data.append('file', image);
    data.append("upload_preset", "ke4rxjf5");
    data.append("cloud_name", "dommos90g");

    try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dommos90g/image/upload", {
            method: "post",
            body: data
        });

        const cloudinaryData = await response.json();
        const imageUrl = cloudinaryData.url;
        console.log(imageUrl);
        const token = localStorage.getItem('token');
        const postData = {
            imageUrl,
            folderName,
            imageName
        };
        const serverResponse = await fetch("https://dobbyserver.onrender.com/api/uploadImage", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify(postData)
        });
        const responseData = await serverResponse.json();
        if (responseData.status === 'ok') {
            toast.success("Image uploaded successfully!");
            await fetchImages(folderId);
            setImagePrompt(false);
            await fetchUserImages();
            
            // setUserImages(prevImages => [...prevImages, { name: imageName, url: imageUrl }]);
        } else {
            toast.error("File name must be Unique");
        }
    } catch (error) {
        toast.error("An error occurred while uploading the image.");
    }
}

    useEffect(() => {
        folders.forEach(folder => {
            fetchImages(folder._id);
        });
    }, [folders]);

    useEffect(() => {
        const filtered = userImages.filter((image) =>
            image.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredImages(filtered);
    }, [searchQuery, userImages]);

    const handleLogout = () => {
        
        localStorage.removeItem('token');
        navigate('/login');
    };


    return (
        <div >
            <div>
            <div className="absolute top-0 left-0 mt-8 ml-8 ">
                <div onClick={()=>setCreateFolderPrompt(true)} className="flex flex-col mb-4 items-center cursor-pointer">
                    <img src={folder2} alt="folder2" width={64} height={64}/>
                    <p>New Folder</p>
                </div>
                <div onClick={()=>setsearchClicked(true)} className="flex flex-col mb-4 items-center cursor-pointer">
                    <img src={imageSearch} alt="imageSearch" width={64} height={64}/>
                    <p>Search Gallery</p>
                </div>
                {folders && folders.map((folder, index) => (
                    folder.parentFolder === null && (
                        <div key={index} onClick={() => folderTriggered(folder.name,folders)} className="flex flex-col mb-4 items-center cursor-pointer">
                            <img src={folder1} alt="folder" width={64} height={64}/>
                            <div className='mb-2'>{folder.name}</div>
                        </div>
                    )
                ))}
            </div>
            <div className="absolute top-0 left-0 mt-8 ml-8 z-10"  style={{marginTop:'250px',marginLeft:'850px'}}>
                {createFolderPrompt && (
                    <Draggable
                    onStart={() => {
                        document.body.style.overflow = 'hidden';
                      }}
                      onStop={() => {
                        document.body.style.overflow = 'visible';
                      }}
                    >
                    <div className='bg-[#FFE6E6] rounded-md'>
                        <div className="bg-[#E1AFD1] rounded-sm" > 
                            <div className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2" style={{marginLeft:'195px',marginTop:'4px'}}></div>
                            <div onClick={()=>setCreateFolderPrompt(false)} className="w-4 h-4 bg-red-500 rounded-full inline-block cursor-pointer"></div>
                        </div>
                        {!openFolder && (<form onSubmit={(e) => createFolder(e, null)} className="p-4 mb-4 flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Folder Name"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    className="p-2 border border-gray-300 rounded mr-2"
                                />
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Folder</button>
                        </form>)}
                        {openFolder && (<form onSubmit={(e) => createFolder(e, folderId)} className="p-4 mb-4 flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Folder Name"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    className="p-2 border border-gray-300 rounded mr-2"
                                />
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Folder</button>
                        </form>)}
                        
                    </div>
                    </Draggable>
                )}
                

                {!createFolderPrompt && imagePrompt && (
                    <Draggable
                    onStart={() => {
                        document.body.style.overflow = 'hidden';
                      }}
                      onStop={() => {
                        document.body.style.overflow = 'visible';
                      }}
                    >
                    <div className='bg-[#FFE6E6] rounded-md'>
                        <div className="bg-[#E1AFD1] rounded-sm" > 
                            <div className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2" style={{marginLeft:'195px',marginTop:'4px'}}></div>
                            <div onClick={()=>setImagePrompt(false)} className="w-4 h-4 bg-red-500 rounded-full inline-block cursor-pointer"></div>
                        </div>
                        <div className='p-4 flex flex-col gap-4'>
                            <input type="file" onChange={(e) => setImage(e.target.files[0])} className="mb-2" />
                            <input
                                type="text"
                                placeholder="Image Name"
                                value={imageName}
                                onChange={(e) => setImageName(e.target.value)}
                                className="p-2 border border-gray-300 rounded mr-2"
                            />
                            <button
                                disabled={isUploadButtonDisabled}
                                onClick={() => submitImage(fName)}
                                className={`px-4 py-2 rounded ${isUploadButtonDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                            >
                                Upload
                            </button>
                        </div>
                        
                    </div>
                    </Draggable>
                )}
            </div>
            <div className="absolute top-0 left-0 mt-8 ml-8 " style={{marginTop:'150px',marginLeft:'450px'}} >
                {openFolder && (
                    <Draggable
                    onStart={() => {
                        document.body.style.overflow = 'hidden';
                      }}
                      onStop={() => {
                        document.body.style.overflow = 'visible';
                      }}
                    >
                    <div className='flex flex-col gap-2 bg-violet-900' style={{width:'600px',height:'400px'}}>
                        <div className="bg-[#E1AFD1] rounded-sm" > 
                            <div className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2" style={{marginLeft:'525px',marginTop:'4px'}}></div>
                            <div onClick={()=>setOpenFolder(false)} className="w-4 h-4 bg-red-500 rounded-full inline-block cursor-pointer"></div>
                        </div>
                        <div className='flex flex-row gap-2 p-4'>
                            {folders.map((folder, index) => {
                            if (folder.parentFolder && folder.parentFolder.toString() === folderId) {
                                return (
                                    <div key={index} onClick={() => folderTriggered(folder.name,folders)} className='cursor-pointer'>
                                        <img src={folder1} alt="subfolder" width={64} height={64} />
                                        <div className="mb-2">{folder.name}</div>
                                    </div>
                                );
                            }
                            return null; // Skip rendering if the parentFolder doesn't match folderId
                            })}
                        </div>
                        <div className="flex flex-row mb-2 pl-4">
                            {folderImages[folderId] && folderImages[folderId].map((image) => (
                                <div key={image._id} className="mr-2 cursor-pointer" onClick={()=>imageTriggered(image)}>
                                    <img src={image2} alt="subfolder" width={64} height={64} />
                                    <p className="mt-2">{image.name}</p>
                                </div>
                            ))}
                        </div>
                        

                        <div className='flex flex-row gap-2 pl-4'>
                            <div className="flex flex-col mb-4 items-center cursor-pointer">
                                <img src={folder2} alt="folder2" width={64} height={64} onClick={() => setCreateFolderPrompt(true)} />
                                <p>New Folder</p>
                            </div>
                            <div className="flex flex-col mb-4 items-center cursor-pointer">
                                <img src={uploadImage} alt="folder2" width={64} height={64} onClick={() => setImagePrompt(true)} />
                                <p>New Image</p>
                            </div>
                        </div>
                    </div>
                    </Draggable>
                )}
                
            </div>
            <div className="absolute top-0 left-0 mt-8 ml-8" style={{marginTop:'50px',marginLeft:'250px'}}>
                {imageClicked && (
                    <Draggable
                    onStart={() => {
                        document.body.style.overflow = 'hidden';
                      }}
                      onStop={() => {
                        document.body.style.overflow = 'visible';
                      }}
                    >
                    <div>
                        <div className="bg-[#E1AFD1] rounded-sm" > 
                            <div className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2" style={{marginLeft:'240px',marginTop:'4px'}}></div>
                            <div onClick={()=>setImageClicked(false)} className="w-4 h-4 bg-red-500 rounded-full inline-block cursor-pointer"></div>
                        </div>
                        <img src={imageUrl} alt="imageUrl" width={300} height={300} />
                    </div>
                    </Draggable>
                )}
            </div>
            <div className="absolute top-0 left-0 mt-8 ml-8" style={{marginTop:'50px',marginLeft:'650px'}}>
                {searchClicked && (
                    <Draggable
                    onStart={() => {
                        document.body.style.overflow = 'hidden';
                      }}
                      onStop={() => {
                        document.body.style.overflow = 'visible';
                      }}
                    >
                    <div className='p-2 bg-[#FFE6E6]'>
                        <div className="bg-[#E1AFD1] rounded-sm" > 
                            <div className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2" style={{marginLeft:'195px',marginTop:'4px'}}></div>
                            <div onClick={()=>setsearchClicked(false)} className="w-4 h-4 bg-red-500 rounded-full inline-block cursor-pointer"></div>
                        </div>
                        <div className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Search images..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="p-2 border border-gray-300 rounded"
                                />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 ">
                            {filteredImages.map((image) => (
                                <div key={image._id} className="cursor-pointer" onClick={()=>imageTriggered(image)}>
                                    <img src={image2} alt="subfolder" width={64} height={64} />
                                    <p>{image.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    </Draggable>
                )}
            </div>
            <div className="fixed bottom-0 left-0 w-full bg-purple-900 p-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={startmenu} alt="Start Menu" width={24} height={24} />
              </button>
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={fileExplorer} alt="File Explorer" width={24} height={24} />
              </button>
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={browser} alt="Browser" width={24} height={24} />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={volume} alt="Volume" width={24} height={24} />
              </button>
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={network} alt="Network" width={24} height={24} />
              </button>
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={calendar} alt="Calendar" width={24} height={24} />
              </button>
              <button className={`text-white ${buttonHoverClass}`}>
                <img src={settings} alt="Settings" width={24} height={24} />
              </button>
              <button onClick={handleLogout} className={`text-white text-xl ${buttonHoverClass}`}>
                Logout
              </button>
            </div>
            </div>
            </div>
        </div>
    );
}

export default Home;
    