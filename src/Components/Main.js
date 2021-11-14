import React, { useState } from 'react'

export const Main = () => {

    let [returnMessages, setReturnMessages] = useState([])

    const doSomeThing = () => {
        const msg = "Done :)"
        addMassage(msg)
    }

    const addMassage = (msg) => {
        setReturnMessages([...returnMessages, `\n ${msg}`])

    }

    const buttenStyle = {
        backgroundColor: 'grey',
        width: '150px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        cursor: 'pointer',
        marginTop: '20px'
    }

    const buttonContainerStyle = {
        position: 'absolute',
        top: '10vh',
        left: 'calc(50vw - 75px)'
    }

    return (
        <>
            <div
                style={buttonContainerStyle}
            >
                <div
                    style={buttenStyle}
                    onClick={doSomeThing}
                > do something</div>

                <div
                    style={buttenStyle}
                    onClick={doSomeThing}
                > do something</div>
            </div>
            {returnMessages.map(msg => <div>{msg}</div>)}
        </>
    )
}