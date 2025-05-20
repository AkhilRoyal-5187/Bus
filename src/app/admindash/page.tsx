"use client"
import React from "react";
import * as XLSX from "xlsx";
import { useState } from "react";

// const users = await getUsers() || [];


export default  function AdminDash(){

    // file
    const [file, setFile] = useState<File | null>(null)
    const [jsonData, setJsonData] = useState("");
    console.log(file);


    function previeData(){
        if(file){
            const reader = new FileReader();
            //Read the file as binary string
            reader.onload =(e)=>{
                const data = e.target?.result;
                if(data){
                    const workbook = XLSX.read(data, {type: "binary"});
                    //steps 1. get sheet names
                    const sheetNames = workbook.SheetNames[0];
                    // step 2. get worksheet
                    const worksheet = workbook.Sheets[sheetNames];
                    //step 3 .  json conversion
                    const jasonData = XLSX.utils.sheet_to_json(worksheet)
                    setJsonData(JSON.stringify(jasonData, null, 2)); 

                }
            }
            //doubte
            //step 4. read the file
            // reader.readAsArrayBuffer(file);

            reader.readAsBinaryString(file);
        }
    }
    return(
        <div>
            <div className="flex justify-center gap-8">
                <div className="div">

                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
                    <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                     id="file_input"
                     type="file" 
                     accept=".xlsx, .xls"
                     onChange={(e)=> setFile(e.target.files? e.target.files[0] : null)}/>


                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">Plese uplode the date in excel and have all the fields (id, name, age, gender, aadar, course,mobileNo, college, depo)</p>

                    <div className="flex justify-center mt-8 gap-5 font-extrabold text-xl ">
                        <button onClick={previeData}>Preview data</button>
                        <button>Load data</button>
                        <button>Delete data</button>
                    </div>

                    <div className="mt-10">

                    <pre>
                        {jsonData}
                    </pre>
                    <div className="relative overflow-x-auto">


                        {<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-2xl">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Id
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Age
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gender
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Aadhar
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Course
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Mobile No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        College
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Depo
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Id
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Age
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gender
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Aadhar
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Course
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Mobile No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        College
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Depo
                                    </th>
                                </tr>
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Id
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Age
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gender
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Aadhar
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Course
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Mobile No
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        College
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Depo
                                    </th>
                                </tr>
                                {/* {users.map((user)=>{
                                    return(
                                        <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {user.id}
                                            </th>
                                            <td className="px-6 py-4">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.age}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.gender}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.aadhar}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.course}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.mobileNo}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.college}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.depo}
                                            </td>
                                        </tr>
                                    )
                                })} */}
                            </tbody>
                        </table>}
                    </div>

                    </div>
                </div>
               
            </div>
        </div>
    )
    
}