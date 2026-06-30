import React, { useEffect, useState } from 'react';
import "./FindTutors.css";
import TutorResults from '../TutorResults/TutorResults';
import axios from '../api/axios';
import { ClipLoader } from 'react-spinners';

const FindTutors = () => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400); // Shorter debouncing for faster auto-search response
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery === "") {
            setUsers([]);
            return;
        }
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/tutors/search?query=${debouncedQuery}`, { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                setErrMsg("Error fetching tutors: " + error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [debouncedQuery]);

    const handleSearchClick = (e) => {
        e.preventDefault();
        setDebouncedQuery(query);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setDebouncedQuery(query);
        }
    };

  return (
    <div className='findTutorsContainer'>
        <div className='findTutorsMainContainer'>
            <div className='findTutorsHeader'>
                <h3>Search Tutors</h3> 
            </div>
            <div className='findTutorsSearch'>
                <input
                    type="text" 
                    placeholder='Search by name, subject, city, state or class'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSearchClick}>Search</button>
            </div>
        </div>

        <div className='findTutorsResultsWrapper'>
            {loading ? (
                <div className='findTutorsLoader'>
                    <ClipLoader size={60} color={"#88BDA4"} loading={true} />
                </div>
            ) : errMsg ? (
                <div className='findTutorsError'>{errMsg}</div>
            ) : users.length > 0 ? (
                <div className='tutorResultsContainer'>
                    <div className='tutorResults'>
                        {users.map((user) => (
                            <TutorResults key={user._id} user={user} />
                        ))}
                    </div>
                </div>
            ) : query ? (
                <div className='noTutorsFound'>No Tutors Found</div>
            ) : (
                <div className='noTutorsFound'>Please enter a search term</div>
            )}
        </div>
    </div>
  )
}

export default FindTutors;