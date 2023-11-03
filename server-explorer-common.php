<?php

	/*
		v0.0.1

		31/10/2023
		* moved common stuff to this file
	*/

	class Response {
		public array | null $debug;
		public string $error;
		public string $errorCode;
		public string $status;
		public array $data = array();
	}

	function echo_response() : void {
		global $debug_enabled, $response;
		header('Content-Type: application/json; charset=utf-8');
		if (!$debug_enabled) {
			$response->debug = null;
		}
		echo json_encode($response);
	}

	function setResponseError($response, $errorMessage, $errorCode, $debugMessage) : void {
		$response->status = "error";
		$response->error = $errorMessage;
		$response->errorCode = $errorCode;
		$response->debug = array_merge($response->debug, array("debug-message" => $debugMessage));	
	}

	function logToResponse($message) : void {
		global $response;
		array_push($response->debug["log"], $message);
	}

	function createResponse() : Response {
		$response = new Response();
		$response->debug = array('_files' => $_FILES, '_server' => $_SERVER, '_post' => $_POST, "log" => []);
		return $response;
	}

?>