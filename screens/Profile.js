
import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions, Image, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native'
import { Fab, Button, Text } from 'native-base';
const { width, height } = Dimensions.get('window');
import { MaterialIcons } from '@expo/vector-icons';
import { DataLayerValue } from '../Context/DataLayer';
import { Config } from '../config'
import LottieView from 'lottie-react-native';
import Postcard from '../components/Postcard';
import Headingbar from '../components/Header';
import { BottomSheet } from 'react-native-btr';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { DefaultTheme, DarkTheme, useTheme } from '@react-navigation/native';

const Profile = (props) => {
    const [{ userToken, UserId, user }, dispatch] = DataLayerValue()
    const [load, setload] = useState(true);
    const [active, setactive] = useState(false)
    const [refresh, setrefresh] = useState(false)
    const [visible, setvisible] = useState(false);
    const [username, setusername] = useState(user.user.username);
    const [postimage, setpostimage] = useState(user.user.userphoto)
    const [body, setbody] = useState(user.user.tagline);
    const [image, setimage] = useState('');
    const GoTo_top_function = () => {
        flatListRef.scrollToOffset({ animated: true, offset: 0 });
    }
    const _toggleBottomNavigationView = () => {
        setvisible(!visible);
    };
    const { colors } = useTheme();

    const fetching = async () => {
        try {
            await fetch(`${Config.url}` + `/user/${UserId}`, {
                headers: {
                    'Authorization': 'Bearer ' + `${userToken}`,
                }
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    dispatch({
                        type: "USERPROFILE",
                        data: responseJson
                    })
                    setload(false)
                })
        } catch (e) {
            console.log(e);
        }
    }
    const _pickImagefromCamera = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
                base64: true,
                aspect: [4, 3],
            });

            if (!result.cancelled) {
                const { uri, base64 } = result
                setpostimage(uri);
                setimage(base64)
            }
        } catch (E) {
            console.log(E);
        }
    };
    const _pickImagefromGallery = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
                base64: true,
                aspect: [4, 3],
            });
            if (!result.cancelled) {
                const { uri, base64 } = result
                setpostimage(uri);
                setimage(base64)
            }
        } catch (E) {
            console.log(E);
        }
    }
    const getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
    };
    const _upload = async () => {
        if (postimage == user.user.userphoto) {
            fetch(`${Config.url}` + `/user/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + `${userToken}`,
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({
                    tagline: body,
                    username: username,
                    userphoto: user.user.userphoto
                })
            }).then(res => res.json()).then((resp) => {
                console.log(resp);
            })
        } else {
            const uriArr = postimage.split('.');
            const fileType = uriArr[uriArr.length - 1]
            const file = `data:${fileType};base64,${image}`
            const data = new FormData()
            data.append("file", file)
            data.append("upload_preset", 'primish');
            data.append("cloud_name", "raghavyuva");
            fetch("https://api.cloudinary.com/v1_1/raghavyuva/image/upload", {
                method: "POST",
                body: data,
            }).then(res => res.json()).then((da) => {
                fetch(`${Config.url}` + `/user/update`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + `${userToken}`,
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify({
                        tagline: body,
                        username: username,
                        userphoto: da.secure_url
                    })
                }).then(res => res.json()).then((resp) => {
                    console.log(resp);
                })
            }).catch(err => {
                Alert.alert(err);
            })
        }
    }
    const Reset = () => {
        fetch(`${Config.url}` + `/reset-password`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + `${userToken}`,
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                email: user.user.email
            })
        }).then(res => res.json()).then((resp) => {
            console.log(resp);
            alert(resp.message);
        })
    }
    useEffect(() => {
        fetching()
        getPermissionAsync();
        setTimeout(() => {
            setload(false)
        }, 2000);
    }, [])
    if (load) {
        return (
            <View style={{ justifyContent: "center", flex: 1, backgroundColor: colors.background }}>
                <LottieView
                    loop={true}
                    autoPlay={true}
                    source={require('../animation/5328-loading-11.json')}
                    style={{ width: 400, height: 400 }}
                />
            </View>
        );
    }
    return (
        <View style={{}}>
            <Headingbar {...props} />
            {user.userposts[0] == null ? (
                <>
                    <View style={{ flex: 1,backgroundColor:colors.primary }}>

                        <View style={styles(colors).mainscreen}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image
                                    source={{ uri: user.user.userphoto }}
                                    style={{
                                        height: 150,
                                        width: 150,
                                        borderRadius: 20,
                                        marginVertical: 30,
                                        marginHorizontal: 10
                                    }}
                                />
                                <View>
                                    <View style={{ marginTop: 50 }}>
                                        <Text style={styles(colors).txt1}>
                                            {user.user.username}
                                        </Text>
                                    </View>
                                    <View style={{ width: 250, marginRight: 10 }}>
                                        {user.user.tagline == null ? (
                                            <Text style={styles(colors).txt2}>
                                                {user.user.email}
                                            </Text>
                                        ) : (
                                            <Text style={styles(colors).txt2}>
                                                {user.user.tagline}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={{ position: 'absolute', bottom: 60, marginHorizontal: 20 }}>
                                <Text style={styles(colors).txt2}>
                                    {user.user.email}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', position: 'absolute', bottom: 30, marginHorizontal: 20 }}>
                                <View style={{ marginRight: 5 }}>
                                    <Text style={{
                                        fontWeight: "bold",
                                        fontSize: 15,
                                        color: colors.text
                                    }}>{user.userposts.length} Posts</Text>
                                </View>
                                <View style={{ marginRight: 5 }}>
                                    <Text style={{
                                        fontWeight: "bold",
                                        fontSize: 15,
                                        color: colors.text
                                    }}>{user.user.followers.length} Followers</Text>

                                </View>
                                <View style={{ marginRight: 5 }}>
                                    <Text style={{
                                        fontWeight: "bold",
                                        fontSize: 15,
                                        color: colors.text
                                    }}>{user.user.following.length} Following</Text>
                                </View>

                            </View>
                            <Fab
                                    active={active}
                                    direction="up"
                                    style={{ backgroundColor: colors.primary, }}
                                    position='bottomRight'
                                    onPress={_toggleBottomNavigationView}>
                                    <MaterialIcons name="edit" size={24} color={colors.primary} />
                                </Fab>
                          
                        </View>

                        <Image
                            source={require('../assets/emptyy.png')}
                            style={{ width: width, height: height / 1.7, alignSelf: 'center' }}
                        />
                      
                    </View>
                    
                </>
            ) : (
                <>
                    <FlatList
                        ListHeaderComponent={
                            <View style={styles(colors).mainscreen}>
                                <BottomSheet
                                    visible={visible}
                                    onBackButtonPress={_toggleBottomNavigationView}
                                    onBackdropPress={_toggleBottomNavigationView}
                                >
                                    <View style={styles(colors).bottomNavigationView}>
                                        <View>
                                            <View style={{ justifyContent: "center", alignSelf: 'center', paddingTop: 5 }}>
                                                <TouchableOpacity onPress={_pickImagefromGallery} >
                                                    <Image
                                                        source={{ uri: postimage }}
                                                        style={{
                                                            height: 150,
                                                            width: 150,
                                                            borderRadius: 20,
                                                        }}
                                                    />
                                                    <Text style={{ color: colors.text, textAlign: 'center' }}>Change Photo</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ margin: 5 }}>
                                                <TextInput style={{
                                                    width: "80%", paddingLeft: 10,
                                                    paddingBottom: 10, paddingRight: 10,
                                                    fontSize: 18, color: colors.text,
                                                    borderColor: colors.border,
                                                    borderWidth: 1.5,
                                                    height: 60,
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignSelf: "center",
                                                    opacity: 0.5
                                                }}
                                                    value={username}
                                                    placeholder='Change UserName'
                                                    onChangeText={(useremail) => setusername(useremail)}
                                                    placeholderTextColor={colors.text}
                                                ></TextInput>
                                            </View>
                                            <View style={{ margin: 5 }}>
                                                <TextInput style={{
                                                    width: "80%", paddingLeft: 10,
                                                    paddingBottom: 10, paddingRight: 10,
                                                    fontSize: 18, color: colors.text,
                                                    borderColor: colors.border,
                                                    borderWidth: 1.5,
                                                    height: 60,
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignSelf: "center",
                                                    opacity: 0.5
                                                }}
                                                    value={body}
                                                    placeholder='Change Tagline'
                                                    onChangeText={(useremail) => setbody(useremail)}
                                                    placeholderTextColor={colors.text}
                                                ></TextInput>
                                            </View>
                                            <Button style={{
                                                backgroundColor: colors.primary,
                                                justifyContent: 'center',
                                                alignSelf: "center",
                                                width: 150,
                                                marginTop: 10
                                            }}
                                                onPress={_upload}
                                            >
                                                <Text style={{ color: colors.text}}>Submit</Text>
                                            </Button>
                                        </View>
                                        <Button style={{
                                            backgroundColor: colors.card,
                                            justifyContent: 'center',
                                            alignSelf: "center",
                                            width: width - 50,
                                            marginTop: 25
                                        }}
                                            onPress={Reset}
                                        >
                                            <Text style={{ color: colors.text }}>Send Password Reset Link to My Email</Text>
                                        </Button>
                                    </View>
                                </BottomSheet>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image
                                        source={{ uri: user.user.userphoto }}
                                        style={{
                                            height: 150,
                                            width: 150,
                                            borderRadius: 20,
                                            marginVertical: 30,
                                            marginHorizontal: 10
                                        }}
                                    />
                                    <View>
                                        <View style={{ marginTop: 50 }}>
                                            <Text style={styles(colors).txt1}>
                                                {user.user.username}
                                            </Text>
                                        </View>
                                        <View style={{ width: 250, marginRight: 10 }}>
                                            {user.user.tagline == null ? (
                                                <Text style={styles(colors).txt2}>
                                                    {user.user.email}
                                                </Text>
                                            ) : (
                                                <Text style={styles(colors).txt2}>
                                                    {user.user.tagline}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ position: 'absolute', bottom: 60, marginHorizontal: 20 }}>
                                    <Text style={styles(colors).txt2}>
                                        {user.user.email}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', position: 'absolute', bottom: 30, marginHorizontal: 20 }}>
                                    <View style={{ marginRight: 5 }}>
                                        <Text style={{
                                            fontWeight: "bold",
                                            fontSize: 15,
                                            color: colors.text,
                                        }}>{user.userposts.length} Posts</Text>
                                    </View>
                                    <View style={{ marginRight: 5 }}>
                                        <Text style={{
                                            fontWeight: "bold",
                                            fontSize: 15,
                                            color:colors.text,
                                        }}>{user.user.followers.length} Followers</Text>

                                    </View>

                                    <View style={{ marginRight: 5 }}>
                                        <Text style={{
                                            fontWeight: "bold",
                                            fontSize: 15,
                                            color: colors.text,
                                        }}>{user.user.following.length} Following</Text>
                                    </View>
                                </View>
                                <Fab
                                    active={active}
                                    direction="up"
                                    containerStyle={{}}
                                    style={{ backgroundColor: colors.primary, }}
                                    position="bottomRight"
                                    onPress={_toggleBottomNavigationView}>
                                    <MaterialIcons name="settings" size={24} color={colors.primary} />
                                </Fab>
                            </View>
                        }
                        renderItem={({ item }) => {
                            return (
                                <Postcard item={item} {...props} />
                            )
                        }}
                        keyExtractor={(item, index) => index.toString()}
                        data={user.userposts}
                        onEndReached={fetching && GoTo_top_function}
                        scrollEnabled
                        onScrollAnimationEnd
                        scrollToOverflowEnabled
                        onEndReachedThreshold={0}
                        refreshing={refresh}
                        onRefresh={fetching}
                        style={{ marginBottom: 50 }}
                    />
                </>
            )}

        </View>
    )
}

export default Profile
const styles = (colors) =>StyleSheet.create({
    mainscreen: {
        height: height / 3,
        backgroundColor: colors.card,
        flexDirection: 'row',
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
        marginBottom: 20
    },
    row1: {
        marginTop: 50,
        marginLeft: 10,
        marginBottom: 10
    },
    txt1: {
        fontSize: 25,
        color:colors.text,
        fontWeight: 'bold'
    },
    txt2: {
        fontSize: 16,
        color: colors.text,
        alignSelf: 'flex-start',
        opacity: 0.9
    },
    carousel: {
        height: '50%',
        backgroundColor: colors.background,
        paddingTop: 30,
    },
    item: {
        borderWidth: 2,
        backgroundColor: colors.background,
        borderRadius: 5,
        borderColor: colors.border,
        elevation: 3,
        flex: 2
    },
    imageBackground: {
        backgroundColor: colors.background,
        borderWidth: 5,
        borderColor: colors.border,
        flex: 1
    },
    rightTextContainer: {
        marginLeft: 'auto',
        marginRight: -2,
        backgroundColor: 'rgba(49, 49, 51,0.5)',
        padding: 3,
        marginTop: 3,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5
    },
    rightText: { color: colors.text },
    lowerContainer: {
        margin: 10
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: colors.text,
    },
    contentText: {
        fontSize: 12,
        color: colors.text
    },
    MainContainer: {
        margin: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: colors.background,
    },
    bottomNavigationView: {
        backgroundColor:colors.background,
        width: '100%',
        height: height / 1.8,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        borderWidth: 0.5,
        borderColor: colors.border
    },
    bottomNavigation: {
        backgroundColor: colors.background,
        width: '100%',
        height: height / 1.9,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        borderWidth: 0.5,
        borderColor: colors.border
    },
})