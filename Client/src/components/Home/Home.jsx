import React from "react";
import Gallery from "./Gallery";

const Home = () => {
	return (
		<section class="py-8 z-10 font-serif">
			<div class="flex flex-col md:flex-row items-center max-w-6xl px-6 py-8 mx-auto">
				<div class="w-full md:w-1/2 py-8">
					<h1 class="text-purple-900 text-7xl font-semibold leading-none tracking-tighter">
						Welcome to <br /><span class="text-blue-500">Our project, <br /></span> Please take a look.
					</h1>
				</div>
				<div class="w-full md:w-1/2 py-8">
					<img src="https://www.svgrepo.com/show/493509/person-who-invests.svg" class="g-image" />
				</div>
			</div>
		</section>

	);
};

export default Home;