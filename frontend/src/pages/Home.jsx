import logo from "../../public/assets/logo.webp";
import exam_img from "../../public/assets/exam_img.png";
import FormInput from "../components/FormInput";
const Home = () => {
    return (
        <div>
            <div class="flex justify-center">
                <div class="flex flex-col items-center">
                    <img src={logo} class="w-[6rem]" alt="" />
                    <h1 class="font-bold">HUK POLY</h1>
                </div>
            </div>

            <div class="flex justify-between py-[4rem] px-16">
                <div>
                    <div>
                        <div class="py-2">
                            <h1 class="text-black font-bold  text-8xl">
                                Welcome
                            </h1>
                            <p class="text-black capitalize ml-4 text-xl ">
                                login to your account
                            </p>
                        </div>
                    </div>

                    <form action="/login" method="POST">
                        <div class="flex flex-col my-4">
                            <FormInput
                                labelFor={"candidateNo"}
                                label={"Candidate Number"}
                                name={"candidateNo"}
                                placeholder={"Enter Your Candidate Number"}
                            />
                            
                            <FormInput
                                labelFor={"password"}
                                label={"password"}
                                name={"password"}
                                placeholder={"Enter Your Password "}
                            />
                            <button
                                type="submit"
                                class="bg-black px-4 py-2 text-white text-lg capitalize "
                            >
                                login
                            </button>
                        </div>
                    </form>
                </div>
                <div class="relative">
                    <div class="absolute -z-10 w-[18rem] h-[18rem] rounded-full bg-black/20"></div>
                    <div class="absolute top-[5rem] right-0 -z-10 w-[20rem] h-[20rem] rounded-full bg-black/40"></div>
                    <img src={exam_img} alt="class exam image" />
                </div>
            </div>
        </div>
    );
};

export default Home;
