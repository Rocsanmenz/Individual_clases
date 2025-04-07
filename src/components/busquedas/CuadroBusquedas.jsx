import React from "react";
import {FormControl, InputGroup} from "react-bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"

const CuadroBusquedas = ({searchText, handeleSearchChange}) => {
    return(
        <InputGroup className="mb-3" style={{width:"400px"}}>
            <InputGroup.Text>
            <i className="bi bi-search"></i>
            </InputGroup.Text>
            <FormControl
                type="text"
                placeholder="Busqueda de producto"
                value={searchText}
                onChange={handeleSearchChange}
            >

            </FormControl>
        </InputGroup>
    );
}

export default CuadroBusquedas;