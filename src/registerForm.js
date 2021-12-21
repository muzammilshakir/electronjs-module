import React, { Component, useState } from 'react';
import { Button, Grid, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
// import { useSnackbar } from 'notistack';

function RegistrationForm( props ) {
    const [name, setName] = useState("")
    const [locationName, setLocationName] = useState("")
    const [locationURL, setLocationURL] = useState("")
    const [cameraIP, setCameraIP] = useState("")
    const [cameraAvailable, setCameraAvailable] = useState(false)
    const [fromActiveTime, setFromActiveTime] = useState("")
    const [toActiveTime, setToActiveTime] = useState("")
    const [isAvailable, setIsAvailable] = useState(false)
    const [isStatic, setIsStatic] = useState(false)
    const [pricePerMinute, setPricePerMinute] = useState(0)
    const submitForm = async (e) => {
        e.preventDefault();
        // enqueueSnackbar('This is a success message');

        const header = {
            name: name,
            locationName: locationName,
            locationURL: locationURL,
            cameraIP: cameraIP,
            cameraAvailable: cameraAvailable,
            fromActiveTime: fromActiveTime,
            toActiveTime: toActiveTime,
            isAvailable: isAvailable,
            isStatic: isStatic,
            pricePerMinute: parseInt(pricePerMinute),
        }
        console.log("Header", header)

        try {

            const response = await axios.post("https://admag-server.herokuapp.com/api/billboard", header);
            console.log(response)


        }
        catch (error) {
            console.log("Error", error)
        }
        document.getElementById("myForm").reset();
    }
    const changeState =()=> {
        this.props.changeRegister(this.props.registered);   
    }

    return (
        <div>
            <h1>Billboard Registration</h1>
            <form fullWidth={true} onSubmit={e => { submitForm(e) }} id="myForm">
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3}>
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            label="Name"
                            fullWidth
                            required={true}
                            onChange={(e) => setName(e.target.value)}

                        />
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            label="Location Name"
                            fullWidth
                            required={true}
                            onChange={(e) => setLocationName(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3}>
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            label="Location URL"
                            fullWidth
                            required={true}
                            onChange={(e) => setLocationURL(e.target.value)}
                        />
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            label="Price Per Minute"
                            type="number"
                            fullWidth
                            required={true}
                            onChange={(e) => setPricePerMinute(e.target.value)}

                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3}>
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-select-currency"
                            select
                            label="Camera Available"
                            fullWidth
                            required={true}
                            onChange={(e) => setCameraAvailable(e.target.value)}
                        >

                            <MenuItem value={true}>True</MenuItem>
                            <MenuItem value={false}>False</MenuItem>
                        </TextField>

                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            label="Camera IP"
                            fullWidth
                            onChange={(e) => setCameraIP(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3}>
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            type="date"
                            // defaultValue="2017-05-24"
                            label="From Active Time"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                              }}
                            onChange={(e) => setFromActiveTime(e.target.value)}

                        />
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-name"
                            type="date"
                            label="To Active Time"
                            // defaultValue="2017-05-24"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                              }}

                            onChange={(e) => setToActiveTime(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3}>
                    </Grid>
                    <Grid item md={3}>
                        <TextField
                            id="outlined-select-currency"
                            select
                            label="Is Available"
                            fullWidth
                            onChange={(e) => setIsAvailable(e.target.value)}
                        >
                            <MenuItem value={true}>True</MenuItem>
                            <MenuItem value={false}>False</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item md={3}>
                        <TextField
                            id="outlined-select-currency"
                            select
                            label="Is Static"
                            fullWidth
                            required={true}
                            onChange={(e) => setIsStatic(e.target.value)}
                        >

                            <MenuItem value={true}>True</MenuItem>
                            <MenuItem value={false}>False</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Button type="submit" variant="contained">Submit</Button>

            </form>
            {/* <Button onClick={(e)=> {changeState(e)}} variant="contained">Submit</Button> */}

        </div>
    );
}
export default RegistrationForm;