import { useState } from "react"
import Loading from "./Loading";

const Homepage = () => {
    const [loading, setLoading] = useState(false);

    return(
        <>
            {loading && (
                <Loading />
            )}
            {!loading && (
                <div className="homepage">
                    <h1>Homepage</h1>
                </div>
            )}
        </>
    )
}

export default Homepage;