import React, { use, useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import TravelStoryCard from "../../components/TravelStoryCard";
import { ToastContainer, toast } from "react-toastify";
import { IoMdAdd } from "react-icons/io";
import Modal from "react-modal";
import AddEditTravelStory from "../../components/AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../components/EmptyCard";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import { FilterInfoTitle } from "../../components/FilterInfoTitle";
import { getEmptyCardMessage } from "../../utils/helper";

function Home() {
  const [allStories, setAllStories] = useState([]);
  const [searchQuery,setSearchQuery]=useState("")
  const [filterType,setFilterType]=useState("")

  const [dateRange,setDateRange]=useState({from:null,to:null})

  const [OpenAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  //Get all travel stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/travel-story/get-all");

      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.");
    }
  };

  //Handle Edit Story

  const handleEdit = async (data) => {
    setOpenAddEditModal({isShown:true,type:"edit",data:data})
  }

  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
    try {
      const response = await axiosInstance.put(
        "/travel-story/update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );

      if (response.data && response.data.story) {
        toast.success("Story updated successfully!");
        getAllTravelStories();
      }
    } catch (error) {
      console.error("Something went wrong. Please try again!");
    }
  }

  //delete story
  const deleteTravelStory=async(data)=>{
      const storyId=data._id
      try{
        const response=await axiosInstance.delete("/travel-story/delete-story/"+storyId)
        if(response.data&&!response.data.error){
          toast.success("Story deleted successfully!")

          setOpenViewModal((prevState)=>({...prevState,isShown:false}))
          getAllTravelStories()
        }

      }catch(error){
        console.log("Something went wrong. Please try again.")
      }
  }

  //search story
  const onSearchStory=async(query)=>{
    try {
      const response=await axiosInstance.get("/travel-story/search",{
        params:{
          query:query,
        },
      })

      if(response.data &&response.data.stories){
        setFilterType("search")
        setAllStories(response.data.stories)
      }
    } catch (error) {
      console.log("Something went wrong")
    }
  }

  //Clear search
  const handleClearSearch= async()=>{
     console.log("Clear search triggered");
     setSearchQuery("");
    setFilterType("")
    await getAllTravelStories();

    
  }

  //Handle filter travel story by date range
  const filterStoriesByDate=async(day)=>{
    try{
      const startDate=day.from ? moment(dateRange.from).valueOf():null
      const endDate=day.to ? moment(day.to).valueOf():null

      if(startDate && endDate){
        const response=await axiosInstance.get("/travel-story/filter",{
          params:{startDate,endDate},
        })

        if(response.data && response.data.stories){
          setFilterType("date")
          setAllStories(response.data.stories)
        }
      }
    }catch(error){
      console.log("Something went wrong. Please try again.")
    }
  }

  // Handle date range click
  const handleDayClick=(day)=>{
    setDateRange(day)
    filterStoriesByDate(day)
  }

  const resetFilter=()=>{
    setDateRange({from:null ,to:null})
    setFilterType("")
    getAllTravelStories()
  }

  useEffect(() => {
    getAllTravelStories();

    return () => {};
  }, []);

  return (
    <>
      <Navbar  searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory} 
      handleClearSearch={handleClearSearch}/>

      

      <div className=" mx-8 py-3 ">
        <FilterInfoTitle filterType={filterType} filterDate={dateRange} onClick={resetFilter}/>
        <div className="flex gap-10">
          
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2  gap-4">
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imageUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onEdit={() => handleEdit(item)}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard imgSrc={"https://images.pexels.com/photos/5706021/pexels-photo-5706021.jpeg"}
              message={getEmptyCardMessage(filterType)}

                setOpenAddEditModal=
                {()=>setOpenAddEditModal
                  ({
                  isShown:true,
                  type:"add",
                  data:null
                })
              }
              />
            )}
          </div>
          <div className="w-[330px] ">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker captionLayout="dropdown" mode="range" selected={dateRange}
                onSelect={handleDayClick}
                pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add & Edit Travel Story */}
      <Modal
        isOpen={OpenAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="modal-box scrollbar"
      >
        <AddEditTravelStory
          storyInfo={OpenAddEditModal.data}
          type={OpenAddEditModal.type}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/* View travel story modal */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="modal-box scrollbar"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState)=>({...prevState,isShown:false}))
          }}
          onEditClick={() => {
            setOpenViewModal((prevState=>({...prevState,isShown:false})))
            handleEdit(openViewModal.data||null)
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data||null)
          }}
        />
      </Modal>

      <button
        className="w-14 h-14 flex items-center justify-center rounded-full bg-[#05b6d3] hover:bg-cyan-400  fixed bottom-8 right-8  "
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <IoMdAdd className="text-[28px] text-white" />
      </button>
      <ToastContainer />
    </>
  );
}

export default Home;
