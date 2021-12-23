import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Button, Grid, TextField, MenuItem, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { addBillboard } from "./utils/index";
function RegistrationForm(props) {
    const queryClient = useQueryClient();
    const { isLoading, mutate: createBillboard } = useMutation(addBillboard, {
        onSuccess: () => {
            queryClient.invalidateQueries('billboard');
        },
    });
    // const [registered,setRegistered] = useState(props.registered)
    const [name, setName] = useState("")
    const [locationName, setLocationName] = useState("")
    const [locationURL, setLocationURL] = useState("")
    const [cameraIP, setCameraIP] = useState("")
    const [cameraAvailable, setCameraAvailable] = useState(false)
    const [fromActiveTime, setFromActiveTime] = useState("")
    const [toActiveTime, setToActiveTime] = useState("")
    const [pricePerMinute, setPricePerMinute] = useState(0)
    const submitForm = async (e) => {
        e.preventDefault();
        const header = {
            name: name,
            locationName: locationName,
            locationURL: locationURL,
            cameraIP: cameraAvailable ? cameraIP : " ",
            cameraAvailable: cameraAvailable,
            fromActiveTime: fromActiveTime,
            toActiveTime: toActiveTime,
            pricePerMinute: parseInt(pricePerMinute),
        }
        try {
            createBillboard(header);

            props.setRegistered(!props.registered)

        }
        catch (error) {
            console.log("Error", error)

        }
    }

    return (
        <div>
            <h1>Billboard Registration</h1>
            <form
                fullWidth={true}
                onSubmit={e => { submitForm(e) }}
                id="myForm"
            >
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}
                >
                    <Grid
                        item
                        md={3}
                    ></Grid>
                    <Grid
                        item
                        md={3}
                    >

                        <TextField
                            id="outlined-name"
                            label="Name"
                            fullWidth
                            required={true}
                            value={name}
                            onChange={(e) => setName(e.target.value)}

                        />
                    </Grid>
                    <Grid
                        item
                        md={3}
                    >
                        <TextField
                            id="outlined-name"
                            label="Location Name"
                            fullWidth
                            required={true}
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}
                >

                    <Grid
                        item
                        md={3}
                    ></Grid>
                    <Grid
                        item
                        md={3}
                    >
                        <TextField
                            id="outlined-name"
                            label="Location URL"
                            fullWidth
                            required={true}
                            value={locationURL}
                            onChange={(e) => setLocationURL(e.target.value)}
                        />
                    </Grid>
                    <Grid
                        item
                        md={3}
                    >
                        <TextField
                            id="outlined-name"
                            label="Price Per Minute"
                            type="number"
                            fullWidth
                            required={true}
                            value={pricePerMinute}
                            onChange={(e) => setPricePerMinute(e.target.value)}

                        />
                    </Grid>
                </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}
                >
                    <Grid
                        item
                        md={3}
                    ></Grid>
                    <Grid
                        item
                        md={3}
                    >
                        <TextField
                            id="outlined-select-currency"
                            select
                            label="Camera Available"
                            fullWidth
                            required={true}
                            value={cameraAvailable}
                            onChange={(e) => setCameraAvailable(e.target.value)}
                        >

                            <MenuItem value={true}>True</MenuItem>
                            <MenuItem value={false}>False</MenuItem>
                        </TextField>

                    </Grid>
                    {cameraAvailable &&
                        <Grid
                            item
                            md={3}
                        >
                            <TextField
                                id="outlined-name"
                                label="Camera IP"
                                fullWidth
                                value={cameraIP}
                                onChange={(e) => setCameraIP(e.target.value)}
                                required={true}
                            />
                        </Grid>
                    }
                </Grid>
                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 4 }}>
                    <Grid
                        item
                        md={3}
                    ></Grid>
                    <Grid item
                        md={3}>
                        <TextField
                            id="outlined-name"
                            type="time"
                            required={true}
                            label="From Active Time"
                            value={fromActiveTime}
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => setFromActiveTime(e.target.value)}

                        />
                    </Grid>
                    <Grid item
                        md={3}>
                        <TextField
                            id="outlined-name"
                            type="time"
                            label="To Active Time"
                            required={true}
                            fullWidth
                            value={toActiveTime}
                            InputLabelProps={{
                                shrink: true,
                            }}

                            onChange={(e) => setToActiveTime(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container
                    spacing={2}
                    sx={{ mb: 4 }}>
                </Grid>
                <Box sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    m: 1
                }}>
                    {!isLoading ?
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Submit
                        </Button>
                        : <></>}
                    {isLoading ?
                        <Button
                            type="submit"
                            variant="contained"
                            disabled
                        >
                            {<CircularProgress color="primary" />}
                        </Button>
                        : <></>}

                </Box>
            </form>

        </div>
    );
}
export default RegistrationForm;