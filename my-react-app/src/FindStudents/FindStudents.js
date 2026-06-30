import React, { useEffect, useState } from 'react';
import StudentResults from "../Components/StudentResults/StudentResults";
import "./FindStudents.css";
import axios from '../api/axios';
import { ClipLoader } from 'react-spinners';

const FindStudents = () => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [users, setUsers] = useState([]);
      
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
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
                const response = await axios.get(`/students/search?query=${debouncedQuery}`, { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                setErrMsg("Error fetching students: " + error);
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
    <div className="findStudentsContainer">
      <div className="findStudentsMainContainer">
        <div className="findStudentsHeader">
          <h3>Search Students</h3>
        </div>
        <div className="findStudentsSearch">
          <input
            type="text" 
            placeholder='Search by name, subject, class, syllabus or tutor'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>
      </div>
      
      <div className='findStudentsResultsWrapper'>
        {loading ? (
            <div className='findStudentsLoader'>
                <ClipLoader size={60} color={"#88BDA4"} loading={true} />
            </div>
        ) : errMsg ? (
            <div className='findStudentsError'>{errMsg}</div>
        ) : users.length > 0 ? (
            <div className='studentResultsContainer'>
              <div className='studentResults'>
                  {users.map((user) => (
                      <StudentResults key={user._id} user={user} />
                  ))}
              </div>
            </div>
        ) : query ? (
            <div className='noStudentsFound'>No Students Found</div>
        ) : (
            <div className='noStudentsFound'>Please enter a search term</div>
        )}
      </div>
    </div>
  )
}

export default FindStudents;