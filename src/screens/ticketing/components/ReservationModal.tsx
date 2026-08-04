/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../contexts/themeContext';
import { SeatState } from './Seat';

interface Props {

    visible:boolean;

    seat:SeatState | null;

    onClose:()=>void;

    onOverride?:()=>void;

}

export default function ReservationModal({

    visible,

    seat,

    onClose,

    onOverride,

}:Props){

    const {colors}=useTheme();

    return(

        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}>

            <View style={styles.overlay}>

                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor:colors.card,
                        },
                    ]}>

                    <View style={styles.iconContainer}>

                        <Icon
                            name="clock-outline"
                            size={60}
                            color="#F9A825"
                        />

                    </View>

                    <Text
                        style={[
                            styles.title,
                            {
                                color:colors.text,
                            },
                        ]}>

                        Seat Reserved

                    </Text>

                    <Text
                        style={[
                            styles.message,
                            {
                                color:colors.secondary,
                            },
                        ]}>

                        Seat {seat?.seatNo} is temporarily reserved.

                    </Text>

                    <View style={styles.infoBox}>

                        <Text style={styles.infoLabel}>
                            Reserved By
                        </Text>

                        <Text style={styles.infoValue}>
                            {seat?.passengerId ?? "--"}
                        </Text>

                    </View>

                    <View style={styles.infoBox}>

                        <Text style={styles.infoLabel}>
                            Reservation Ends
                        </Text>

                        <Text style={styles.infoValue}>
                            {seat?.reservedUntil ?? "--"}
                        </Text>

                    </View>

                    <TouchableOpacity
                        style={styles.overrideButton}
                        onPress={onOverride}>

                        <Icon
                            name="lock-open-variant"
                            size={20}
                            color="#FFF"
                        />

                        <Text style={styles.overrideText}>
                            Override Reservation
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}>

                        <Text style={styles.closeText}>
                            Close
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </Modal>

    );

}

const styles=StyleSheet.create({

    overlay:{
        flex:1,
        backgroundColor:'rgba(0,0,0,.45)',
        justifyContent:'center',
        alignItems:'center',
        padding:24,
    },

    card:{
        width:'100%',
        maxWidth:500,
        borderRadius:18,
        padding:24,
    },

    iconContainer:{
        alignItems:'center',
        marginBottom:15,
    },

    title:{
        fontSize:24,
        fontWeight:'700',
        textAlign:'center',
    },

    message:{
        textAlign:'center',
        marginTop:8,
        marginBottom:25,
    },

    infoBox:{
        marginBottom:15,
        borderWidth:1,
        borderColor:'#ECEFF1',
        borderRadius:10,
        padding:15,
    },

    infoLabel:{
        color:'#888',
        marginBottom:5,
    },

    infoValue:{
        fontWeight:'700',
        fontSize:16,
    },

    overrideButton:{
        backgroundColor:'#EF6C00',
        height:52,
        borderRadius:12,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        marginTop:10,
    },

    overrideText:{
        color:'#FFF',
        fontWeight:'700',
        marginLeft:10,
    },

    closeButton:{
        height:52,
        borderRadius:12,
        backgroundColor:'#ECEFF1',
        justifyContent:'center',
        alignItems:'center',
        marginTop:15,
    },

    closeText:{
        fontWeight:'700',
        color:'#444',
    },

});