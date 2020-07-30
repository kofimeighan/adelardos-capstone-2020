// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;
import com.google.appengine.api.users.UserService;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import com.google.sps.servlets.LoginServlet;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Before;
import org.junit.Test;
import java.io.*;


/** */
@RunWith(JUnit4.class)
public final class LoginServletTest {
    @Spy 
    private LoginServlet loginServlet;

    @Test
    public void checkingLoginStatus() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        UserService userService = mock(UserService.class);

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        loginServlet.doPost(request, response);

        when(userService.isUserLoggedIn()).thenReturn(false);
        System.out.println(stringWriter.toString());
        System.out.println("-----------------------------------------------------");
        assertTrue(stringWriter.toString().contains("Login"));
    }
}