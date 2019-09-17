/*
 * SPDX-License-Identifier: Apache-2.0
 *     _____________  ___  
      / ___/ ___/ _ \/ _ \ 
     (__  ) /  /  __/  __/ 
    /____/_/   \___/\___  
 * File Created: Friday, 16th August 2019 1:49:06 pm
 * Author: SreeTeja06 (sreeteja.muthyala@gmail.com)

 */
let express = require( 'express' )
let router = express.Router()

let { mongoose } = ( '../db/mongoose' );

let User = require( './user' );
let { authenticate } = require( '../middleware/authentication' );
require( '../config/config' );

const awaitHandler = fn => {
    return async ( req, res, next ) => {
        try {
            await fn( req, res, next );
        } catch ( err ) {
            next( err );
        }
    };
};

router.post( '/users', awaitHandler( ( req, res ) => {
    let body = {
        email: req.body.email,
        password: req.body.password,
        admin: req.body.admin
    }
    let user = new User( body );
    user.save().then( () => {
        return user.generateAuthToken();
    } ).then( ( token ) => {
        res.header( 'x-auth', token ).send( user );
    } ).catch( ( e ) => {
        res.status( 400 ).send( e );
    } )
} ) );

router.post( '/users/login', awaitHandler( ( req, res ) => {
    let body = {
        email: req.body.email,
        password: req.body.password
    }

    User.findByCredentials( body.email, body.password ).then( ( user ) => {
        return user.generateAuthToken().then( ( token ) => {
            res.header( 'x-auth', token ).send( user );
        } );
    } ).catch( ( e ) => {
        res.status( 400 ).send();
    } );
} ) );

router.get( '/users/me', authenticate, awaitHandler( ( req, res ) => {
    res.send( req.user );
} ) );

router.delete( '/users/logout', authenticate, awaitHandler( ( req, res ) => {
    req.user.removeToken( req.token ).then( () => {
        res.status( 200 ).send();
    }, () => {
        res.status( 400 ).send();
    } );
} ) );

module.exports = router