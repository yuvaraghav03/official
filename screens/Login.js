import React, { useState, } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
const { height: screenHeight } = Dimensions.get('window');
import { Config } from '../config';
import { DataLayerValue } from "../Context/DataLayer";
import * as SecureStore from 'expo-secure-store';
import { Button } from "native-base";
import * as Google from "expo-google-app-auth";

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [{ userToken }, dispatch] = DataLayerValue()
    const [lname, setlname] = useState('');
    const [photo, setphoto] = useState('');
    const [dob, setdob] = useState('');
    const [fname, setfname] = useState('');
    const [pass, setpass] = useState('');
    const [emailby, setemailby] = useState('');
    const onsignin = () => {
        if (!email || !password) {
            alert("input fields cannot be as empty as like that")
        } else {
            fetch(`${Config.url}` + `/login`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
                .then((response) => response.json())
                .then((responseData) => {
                    if (responseData.message == 'Auth successfull') {
                        dispatch({
                            type: 'LOGIN',
                            token: responseData.token,
                            id: responseData.user._id
                        })
                        SecureStore.setItemAsync('userToken', responseData.token);
                        SecureStore.setItemAsync('UserId', responseData.user._id)
                        setEmail(null);
                        setPassword(null);
                    }
                    else {
                        alert(responseData.message);
                    }
                })
                .done();
        }
    }
    const Loginwith = () => {
        try {
            fetch(`${Config.url}` + `/login`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailby,
                    password: pass
                })
            })
                .then((response) => response.json())
                .then((responseData) => {
                    console.log(responseData);
                    if (responseData.message == 'Auth successfull') {
                        dispatch({
                            type: 'LOGIN',
                            token: responseData.token,
                            id: responseData.user._id
                        })
                        SecureStore.setItemAsync('userToken', responseData.token);
                        SecureStore.setItemAsync('UserId', responseData.user._id)
                        setemailby(null);
                        setpass(null);
                    }
                    else {
                        alert(responseData.message);
                    }
                })
                .done();
        } catch (error) {
            alert(error)
        }
    }
    const Googlesingin = async () => {
        try {
            const result = await Google.logInAsync({
                androidClientId: Config.Android,
                iosClientId: Config.IOS,
                scopes: ["profile", "email"],
            });
            console.log(result)
            if (result.type === "success") {
                console.log(result.user);
                setemailby(result.user.email);
                setpass(result.user.id);
                Loginwith();
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            alert(e);
            return { error: true };
        }
    }
    return (
        <View style={styles.main}>
            <Text style={{ justifyContent: 'center', textAlign: 'center', color: "#fff", fontSize: 30, fontWeight: '800' }}></Text>
            <View style={styles.middle}>
                <Text style={{ marginTop: 20, color: "#b3b3b3" }}>Email</Text>
                <TextInput style={{ borderBottomColor: "#8b8b8b", borderBottomWidth: 1, width: "100%", paddingLeft: 10, paddingBottom: 10, paddingRight: 10, fontSize: 18, color: "#fff", }}
                    value={email}
                    onChangeText={(useremail) => setEmail(useremail)}
                ></TextInput>
                <Text style={{ marginTop: 20, color: "#b3b3b3" }}>Password</Text>
                <TextInput
                    style={{ borderBottomColor: "#8b8b8b", borderBottomWidth: 1, width: "100%", paddingLeft: 10, paddingBottom: 10, paddingRight: 10, fontSize: 18, color: "#fff", }}
                    value={password}
                    onChangeText={(userPassword) => setPassword(userPassword)}
                ></TextInput>
                <TouchableOpacity style={{ marginTop: 10, alignItems: "center" }}><Text style={{ color: "#b3b3b3" }}>Forgot Password?</Text></TouchableOpacity>
            </View>

            <View style={styles.bottom}>
                <View>
                    <TouchableOpacity style={{ width: "100%", paddingRight: "10%" }} onPress={onsignin}>
                        <LinearGradient
                            colors={['#36D1DC', '#5B86E5']}
                            style={styles.btn1}
                            start={[0, 0]}
                            end={[1, 1]}
                        >
                            <Text
                                style={styles.btntxt}>
                                Login
                </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <View style={styles.acc}>
                    <View><Text style={styles.acctxt}>Don't have an account?</Text></View>
                    <View>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('signup');
                        }}>
                            <Text style={styles.link}> Register</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </View>
            <Button style={{
                backgroundColor: '#5B86E5',
                justifyContent: 'center',
                alignSelf: "center",
                width: 210,
                marginTop: 10
            }}
                onPress={Googlesingin}
            >
                <Text style={{ color: 'white' }}>Sign In With Google</Text>
            </Button>
        </View>
    );
};


export default Login;

const styles = StyleSheet.create({
    main: { flexDirection: "column", height: screenHeight, backgroundColor: "#0E043B" },

    middle: { height: '40%', justifyContent: "center", width: "80%", marginLeft: "10%" },

    mainImg: { width: 271, height: 197, marginBottom: 10 },

    txt2: { fontSize: 18, textAlign: 'center', color: "#252526", fontWeight: "100", marginBottom: 20 },

    bottom: { height: '20%', flexDirection: 'column', justifyContent: "space-around" },

    btn1: { width: "100%", margin: 20, padding: 15, borderRadius: 5, justifyContent: 'center' },

    btn2: { width: 130, margin: 20, padding: 15, alignItems: 'center', borderRadius: 5 },

    btntxt: { backgroundColor: 'transparent', fontSize: 18, color: '#fff', fontWeight: '800', textAlign: "center" },

    acc: { flexDirection: "row", justifyContent: "center", },

    acctxt: { color: "#ccc" },

    link: { color: "#12c2d3", fontWeight: "800" }

});

