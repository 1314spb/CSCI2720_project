import React from "react";
import Gallery from "./Gallery";
import NavBar from "../NavBar/NavBar";

const Home = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen w-full">
			{/* <NavBar/> */}
			<Gallery />
		</div>
	);
};

export default Home;