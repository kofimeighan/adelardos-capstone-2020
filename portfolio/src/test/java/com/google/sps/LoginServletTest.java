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
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.sps.servlets.LoginServlet;
import java.io.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/**
  Tests the Login/Logout URL's of the LoginServlet
*/
@RunWith(JUnit4.class)
public final class LoginServletTest {
  @InjectMocks private LoginServlet loginServlet = new LoginServlet();

  @Mock private HttpServletRequest request;

  @Mock private HttpServletResponse response;

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalUserServiceTestConfig());
  private static final String EMAIL = "test@google.com";

  @Before
  public void setUp() throws Exception {
    MockitoAnnotations.initMocks(this);
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test
  public void logoutMessage() throws Exception {
    helper.setEnvIsLoggedIn(true).setEnvEmail(EMAIL).setEnvAuthDomain("localhost");
    UserService userService = UserServiceFactory.getUserService();

    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    loginServlet.doGet(request, response);

    String logoutUrl = userService.createLogoutURL("/index.html");
    String actual = stringWriter.getBuffer().toString().trim();

    verify(response).setContentType("text/html");
    assertEquals("<a href=\"" + logoutUrl + "\">Logout</a>", actual);
  }

  @Test
  public void loginMessage() throws Exception {
    helper.setEnvIsLoggedIn(false);
    UserService userService = UserServiceFactory.getUserService();

    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    loginServlet.doGet(request, response);

    String loginUrl = userService.createLoginURL("/index.html");
    String actual = stringWriter.getBuffer().toString().trim();

    verify(response).setContentType("text/html");
    assertEquals("<a href=\"" + loginUrl + "\">Login</a>", actual);
  }
}
